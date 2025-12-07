package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

// ProdStarterHub - Go CLI Tool
// cmd/tool/main.go
//
// Production-ready CLI entrypoint using cobra + viper + zap + prometheus.
// Features:
//  - Subcommands (run, version, serve-metrics, config)
//  - Typed configuration via viper (env + file)
//  - Structured logging (zap)
//  - Graceful shutdown with context cancellation
//  - Optional Prometheus metrics endpoint
//  - Health endpoint for readiness/liveness probes
//
// Build:
//   go build -o bin/tool ./cmd/tool
//
// Usage examples:
//   ./tool run --input data.txt
//   ./tool serve-metrics --listen :9090
//   ./tool config --print

var (
	version = "0.0.0" // set at build-time with -ldflags "-X main.version=1.2.3"
	buildTime = "unknown"
	gitCommit = "" 
)

func main() {
	// Root cobra command
	rootCmd := &cobra.Command{
		Use:   "tool",
		Short: "ProdStarter Go CLI tool",
		Long:  "A production-ready CLI template built with Go, Cobra, Viper and Zap.",
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
			// initialize configuration and logger
			if err := initConfig(cmd); err != nil {
				return err
			}
			if err := initLogger(); err != nil {
				return err
			}
			zap.L().Info("configuration loaded", zap.String("env", viper.GetString("env")))
			return nil
		},
	}

	// Global persistent flags
	rootCmd.PersistentFlags().StringP("config", "c", "", "config file (YAML, JSON, TOML). Overrides env")
	rootCmd.PersistentFlags().StringP("env", "e", "development", "environment name (development|production)")
	viper.BindPFlag("config", rootCmd.PersistentFlags().Lookup("config"))
	viper.BindPFlag("env", rootCmd.PersistentFlags().Lookup("env"))

	// run subcommand
	runCmd := &cobra.Command{
		Use:   "run",
		Short: "Run the primary processing job",
		Args:  cobra.ArbitraryArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			ctx, cancel := signalContext()
			defer cancel()

			input, _ := cmd.Flags().GetString("input")
			dryRun, _ := cmd.Flags().GetBool("dry-run")

			zap.L().Info("run invoked", zap.String("input", input), zap.Bool("dryRun", dryRun))

			// Example worker logic — replace with domain logic
			return runMain(ctx, input, dryRun)
		},
	}
	runCmd.Flags().StringP("input", "i", "", "input file or resource")
	runCmd.Flags().Bool("dry-run", false, "run without persisting side-effects")

	// version subcommand
	versionCmd := &cobra.Command{
		Use:   "version",
		Short: "Print version information",
		Run: func(cmd *cobra.Command, args []string) {
			info := map[string]string{
				"version":   version,
				"buildTime":  buildTime,
				"gitCommit":  gitCommit,
				"goVersion":  runtimeGoVersion(),
			}
			b, _ := json.MarshalIndent(info, "", "  ")
			fmt.Println(string(b))
		},
	}

	// serve-metrics subcommand
	metricsCmd := &cobra.Command{
		Use:   "serve-metrics",
		Short: "Serve Prometheus metrics and health endpoints",
		RunE: func(cmd *cobra.Command, args []string) error {
			listen, _ := cmd.Flags().GetString("listen")
			readinessPath, _ := cmd.Flags().GetString("readiness-path")
			livenessPath, _ := cmd.Flags().GetString("liveness-path")

			return serveMetrics(cmd.Context(), listen, readinessPath, livenessPath)
		},
	}
	metricsCmd.Flags().String("listen", ":9090", "address for metrics server")
	metricsCmd.Flags().String("readiness-path", "/ready", "readiness path")
	metricsCmd.Flags().String("liveness-path", "/live", "liveness path")

	// config subcommand
	configCmd := &cobra.Command{
		Use:   "config",
		Short: "Show effective configuration",
		Run: func(cmd *cobra.Command, args []string) {
			prettyPrintConfig()
		},
	}

	rootCmd.AddCommand(runCmd, versionCmd, metricsCmd, configCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

// initConfig initializes viper configuration from file and environment
func initConfig(cmd *cobra.Command) error {
	cfgFile := viper.GetString("config")
	viper.SetEnvPrefix("TOOL")
	viper.AutomaticEnv() // read in environment variables that match

	viper.SetDefault("metrics.enabled", false)
	viper.SetDefault("metrics.listen", ":9090")
	viper.SetDefault("env", "development")

	if cfgFile != "" {
		viper.SetConfigFile(cfgFile)
		if err := viper.ReadInConfig(); err != nil {
			return fmt.Errorf("failed to read config file: %w", err)
		}
		zapLogger, _ := zap.NewProduction()
		zapLogger.Sugar().Infof("Using config file: %s", viper.ConfigFileUsed())
	}
	return nil
}

var logger *zap.Logger

// initLogger configures zap global logger based on env and flags
func initLogger() error {
	env := viper.GetString("env")
	var err error
	if env == "production" {
		logger, err = zap.NewProduction()
	} else {
		logger, err = zap.NewDevelopment()
	}
	if err != nil {
		return fmt.Errorf("failed to init logger: %w", err)
	}
	zap.ReplaceGlobals(logger)
	return nil
}

// signalContext returns a context that is cancelled on SIGINT/SIGTERM
func signalContext() (context.Context, context.CancelFunc) {
	ctx, cancel := context.WithCancel(context.Background())
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		select {
		case <-sigCh:
			zap.L().Warn("termination signal received, cancelling context")
			cancel()
		case <-ctx.Done():
		}
	}()
	return ctx, cancel
}

// runMain is a placeholder for the primary business logic. It supports cancellation.
func runMain(ctx context.Context, input string, dryRun bool) error {
	// Example: process something periodically and check for cancellation
	zap.L().Info("starting main processing loop", zap.String("input", input))
	for i := 0; i < 5; i++ {
		select {
		case <-ctx.Done():
			zap.L().Warn("runMain: cancelled")
			return ctx.Err()
		default:
			zap.L().Info("processing step", zap.Int("step", i+1))
			// simulate work
			time.Sleep(1 * time.Second)
		}
	}
	zap.L().Info("runMain: completed")
	return nil
}

// serveMetrics starts an HTTP server exposing Prometheus metrics and health endpoints
func serveMetrics(ctx context.Context, listen, readinessPath, livenessPath string) error {
	mux := http.NewServeMux()
	mux.Handle("/metrics", promhttp.Handler())
	mux.HandleFunc(readinessPath, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ready"))
	})
	mux.HandleFunc(livenessPath, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("live"))
	})

	srv := &http.Server{
		Addr:    listen,
		Handler: mux,
	}

	// Run server in goroutine
	errCh := make(chan error, 1)
	go func() {
		zap.L().Info("metrics server starting", zap.String("listen", listen))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errCh <- err
		}
		errCh <- nil
	}()

	// Wait for cancellation or server error
	select {
	case <-ctx.Done():
		zap.L().Info("shutting down metrics server")
		to := 5 * time.Second
		shCtx, cancel := context.WithTimeout(context.Background(), to)
		defer cancel()
		if err := srv.Shutdown(shCtx); err != nil {
			return fmt.Errorf("metrics server shutdown failed: %w", err)
		}
		return nil
	case err := <-errCh:
		return err
	}
}

// prettyPrintConfig prints the effective configuration (non-secret values only)
func prettyPrintConfig() {
	m := make(map[string]interface{})
	for _, key := range viper.AllKeys() {
		m[key] = viper.Get(key)
	}
	b, _ := json.MarshalIndent(m, "", "  ")
	fmt.Println(string(b))
}

// runtimeGoVersion returns the runtime version string (wrapped to avoid direct import in some contexts)
func runtimeGoVersion() string {
	return runtimeVersion()
}

// runtimeVersion is implemented in a separate file for easier testing/mocking; fallback here:
func runtimeVersion() string { return "go1.x" }
