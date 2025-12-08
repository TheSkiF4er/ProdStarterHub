package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

// Build-time variables (set with -ldflags)
var (
	version   = "0.0.0"
	buildTime = "unknown"
	commit    = ""
)

// ServerConfig holds runtime configuration for the server
type ServerConfig struct {
	BindAddr           string        `mapstructure:"bind_addr"`
	ReadTimeout        time.Duration `mapstructure:"read_timeout"`
	WriteTimeout       time.Duration `mapstructure:"write_timeout"`
	IdleTimeout        time.Duration `mapstructure:"idle_timeout"`
	ShutdownTimeout    time.Duration `mapstructure:"shutdown_timeout"`
	EnableMetrics      bool          `mapstructure:"enable_metrics"`
	MetricsListen      string        `mapstructure:"metrics_listen"`
	LogLevel           string        `mapstructure:"log_level"`
	Environment        string        `mapstructure:"environment"`
}

func main() {
	// Parse flags
	pflag.String("config", "", "Path to config file (YAML/JSON/TOML)")
	pflag.String("env", "development", "Environment name (development|staging|production)")
	pflag.Parse()
	viper.BindPFlags(pflag.CommandLine)

	// Init config
	if err := initConfig(); err != nil {
		fmt.Fprintf(os.Stderr, "config init failed: %v\n", err)
		os.Exit(2)
	}

	// Load typed config
	var cfg ServerConfig
	if err := viper.Unmarshal(&cfg); err != nil {
		fmt.Fprintf(os.Stderr, "failed to parse config: %v\n", err)
		os.Exit(3)
	}

	// Set sensible defaults if missing
	setDefaults(&cfg)

	// Init logger
	logger, err := initLogger(cfg)
	if err != nil {
		fmt.Fprintf(os.Stderr, "logger init failed: %v\n", err)
		os.Exit(1)
	}
	defer logger.Sync()
	zap.ReplaceGlobals(logger)

	zap.L().Info("starting prodstarter go-chi-rest server",
		zap.String("version", version),
		zap.String("commit", commit),
		zap.String("buildTime", buildTime),
		zap.String("env", cfg.Environment),
		zap.String("bind", cfg.BindAddr),
	)

	// Setup main router
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	// Custom logging middleware using zap
	r.Use(zapLoggerMiddleware())
	// Optional: add CORS, rate-limiting, auth middleware here

	// Routes
	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	r.Get("/readyz", func(w http.ResponseWriter, r *http.Request) {
		// In a real app verify upstream dependencies here
		writeJSON(w, http.StatusOK, map[string]string{"status": "ready"})
	})

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/ping", func(w http.ResponseWriter, r *http.Request) {
			writeJSON(w, http.StatusOK, map[string]string{"message": "pong"})
		})
		// register other handlers here
	})

	// Metrics server (optional)
	var metricsSrv *http.Server
	if cfg.EnableMetrics {
		metricsMux := http.NewServeMux()
		metricsMux.Handle("/metrics", promhttp.Handler())
		metricsMux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
			writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
		})
		metricsSrv = &http.Server{
			Addr:         cfg.MetricsListen,
			Handler:      metricsMux,
			ReadTimeout:  5 * time.Second,
			WriteTimeout: 10 * time.Second,
			IdleTimeout:  30 * time.Second,
		}
		go func() {
			zap.L().Info("metrics server starting", zap.String("listen", cfg.MetricsListen))
			if err := metricsSrv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
				zap.L().Error("metrics server failed", zap.Error(err))
			}
		}()
	}

	// Main HTTP server
	srv := &http.Server{
		Addr:         cfg.BindAddr,
		Handler:      r,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
		IdleTimeout:  cfg.IdleTimeout,
	}

	// Run server in background and listen for shutdown signals
	serverErrors := make(chan error, 1)
	go func() {
		zap.L().Info("http server listening", zap.String("addr", cfg.BindAddr))
		serverErrors <- srv.ListenAndServe()
	}()

	// Signal handling
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		if !errors.Is(err, http.ErrServerClosed) {
			zap.L().Fatal("server crashed", zap.Error(err))
		}
	case sig := <-shutdown:
		zap.L().Info("shutdown signal received", zap.String("signal", sig.String()))
	}

	// Create context for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	// Stop accepting new requests
	if err := srv.Shutdown(ctx); err != nil {
		zap.L().Error("graceful shutdown failed", zap.Error(err))
	} else {
		zap.L().Info("http server stopped")
	}

	// Shutdown metrics server if running
	if metricsSrv != nil {
		if err := metricsSrv.Shutdown(ctx); err != nil {
			zap.L().Error("metrics server shutdown failed", zap.Error(err))
		} else {
			zap.L().Info("metrics server stopped")
		}
	}

	zap.L().Info("shutdown complete")
}

// initConfig initializes viper configuration: file, env, defaults
func initConfig() error {
	cfgFile := viper.GetString("config")
	viper.SetEnvPrefix("APP")
	viper.AutomaticEnv()

	// Support short env var names by replacing dots with underscores
	viper.SetEnvKeyReplacer(nil)

	// If config file provided, read it
	if cfgFile != "" {
		viper.SetConfigFile(cfgFile)
		if err := viper.ReadInConfig(); err != nil {
			return fmt.Errorf("read config file: %w", err)
		}
	}

	// set defaults
	viper.SetDefault("bind_addr", ":8080")
	viper.SetDefault("read_timeout", "5s")
	viper.SetDefault("write_timeout", "10s")
	viper.SetDefault("idle_timeout", "120s")
	viper.SetDefault("shutdown_timeout", "15s")
	viper.SetDefault("enable_metrics", true)
	viper.SetDefault("metrics_listen", ":9090")
	viper.SetDefault("log_level", "info")
	viper.SetDefault("environment", viper.GetString("env"))

	// normalize durations: allow strings in config
	// BindStringToDuration not provided by viper directly; we'll unmarshal later

	return nil
}

func setDefaults(cfg *ServerConfig) {
	if cfg.BindAddr == "" {
		cfg.BindAddr = viper.GetString("bind_addr")
	}
	if cfg.ReadTimeout == 0 {
		cfg.ReadTimeout = parseDurationOrDefault(viper.GetString("read_timeout"), 5*time.Second)
	}
	if cfg.WriteTimeout == 0 {
		cfg.WriteTimeout = parseDurationOrDefault(viper.GetString("write_timeout"), 10*time.Second)
	}
	if cfg.IdleTimeout == 0 {
		cfg.IdleTimeout = parseDurationOrDefault(viper.GetString("idle_timeout"), 120*time.Second)
	}
	if cfg.ShutdownTimeout == 0 {
		cfg.ShutdownTimeout = parseDurationOrDefault(viper.GetString("shutdown_timeout"), 15*time.Second)
	}
	if cfg.MetricsListen == "" {
		cfg.MetricsListen = viper.GetString("metrics_listen")
	}
	if cfg.Environment == "" {
		cfg.Environment = viper.GetString("environment")
	}
	if cfg.LogLevel == "" {
		cfg.LogLevel = viper.GetString("log_level")
	}
}

func parseDurationOrDefault(s string, d time.Duration) time.Duration {
	if s == "" {
		return d
	}
	if dur, err := time.ParseDuration(s); err == nil {
		return dur
	}
	// maybe provided as seconds integer
	if secs, err := strconv.Atoi(s); err == nil {
		return time.Duration(secs) * time.Second
	}
	return d
}

// initLogger configures zap logger based on config
func initLogger(cfg ServerConfig) (*zap.Logger, error) {
	var lvl zap.AtomicLevel
	switch cfg.LogLevel {
	case "debug":
		lvl = zap.NewAtomicLevelAt(zap.DebugLevel)
	case "warn":
		lvl = zap.NewAtomicLevelAt(zap.WarnLevel)
	case "error":
		lvl = zap.NewAtomicLevelAt(zap.ErrorLevel)
	default:
		lvl = zap.NewAtomicLevelAt(zap.InfoLevel)
	}

	cfgZap := zap.Config{
		Level:       lvl,
		Development: cfg.Environment != "production",
		Encoding:    "json",
		EncoderConfig: zap.NewProductionEncoderConfig(),
		OutputPaths: []string{"stdout"},
		ErrorOutputPaths: []string{"stderr"},
	}

	if cfg.Environment != "production" {
		cfgZap.Encoding = "console"
		enc := zap.NewDevelopmentEncoderConfig()
		enc.TimeKey = "ts"
		cfgZap.EncoderConfig = enc
	}

	return cfgZap.Build()
}

// zapLoggerMiddleware returns a chi middleware that logs requests with zap
func zapLoggerMiddleware() func(next http.Handler) http.Handler {
	logger := zap.L()
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			ww := &responseWriter{w, http.StatusOK}
			next.ServeHTTP(ww, r)
			logger.Info("request",
				zap.String("method", r.Method),
				zap.String("path", r.URL.Path),
				zap.Int("status", ww.status),
				zap.Duration("duration", time.Since(start)),
				zap.String("remote", r.RemoteAddr),
			)
		})
	}
}

// responseWriter wraps http.ResponseWriter to capture status code
type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}

// writeJSON is a helper to write JSON responses with safe headers
func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if v == nil {
		return
	}
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	if err := enc.Encode(v); err != nil {
		zap.L().Error("failed to encode json response", zap.Error(err))
	}
}
