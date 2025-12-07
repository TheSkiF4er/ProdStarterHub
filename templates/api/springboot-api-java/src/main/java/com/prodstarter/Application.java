package com.prodstarter;

import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

import java.time.Duration;
import java.util.Arrays;
import java.util.Collections;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * ProdStarter — Spring Boot Application entrypoint (Java)
 *
 * Production-ready Spring Boot application main file with:
 *  - Micrometer MeterRegistry customization (common tags)
 *  - Request logging filter (CommonsRequestLoggingFilter)
 *  - CORS filter wired from property `app.cors.allowed-origins`
 *  - Graceful shutdown helper (ContextClosedEvent listener)
 *  - Global exception handler to avoid leaking internals
 *
 * Customize TODO blocks to add DB, security, tracing, or other integrations.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class Application {

    private static final Logger log = LoggerFactory.getLogger(Application.class);

    // Managed executor for short-lived background tasks — prefer Spring TaskExecutor in prod
    private final ExecutorService backgroundExecutor = Executors.newCachedThreadPool();

    public static void main(String[] args) {
        // Default profile: prefer `production` for released templates; dev can override to `dev`
        String active = System.getProperty("spring.profiles.active");
        if (active == null || active.isBlank()) {
            System.setProperty("spring.profiles.default", "production");
        }

        SpringApplication.run(Application.class, args);
    }

    /**
     * Register common tags on MeterRegistry for consistent metrics labeling.
     */
    @Bean
    public MeterRegistry configureMeters(MeterRegistry registry, Environment env) {
        String appName = env.getProperty("spring.application.name", "prodstarter");
        String envName = env.getProperty("spring.profiles.active",
                env.getProperty("spring.profiles.default", "default"));

        registry.config().commonTags("application", appName, "environment", envName);
        return registry;
    }

    /**
     * Simple request logging filter for incoming HTTP requests. Disable payload logging in production
     * unless needed; it can be noisy and leak sensitive data.
     */
    @Bean
    public CommonsRequestLoggingFilter requestLoggingFilter(Environment env) {
        CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
        filter.setIncludeClientInfo(true);
        filter.setIncludeQueryString(true);
        // set to false in prod; enable in debug when diagnosing issues
        boolean includePayload = Boolean.parseBoolean(env.getProperty("app.logging.include-payload", "false"));
        filter.setIncludePayload(includePayload);
        filter.setMaxPayloadLength(Integer.parseInt(env.getProperty("app.logging.max-payload-length", "1024")));
        filter.setIncludeHeaders(false);
        return filter;
    }

    /**
     * CORS filter configurable via property `app.cors.allowed-origins` (comma separated). In production you
     * should set explicit origins; default is permissive for development only.
     */
    @Bean
    public CorsFilter corsFilter(Environment env) {
        String origins = env.getProperty("app.cors.allowed-origins", "");
        CorsConfiguration config = new CorsConfiguration();
        if (origins == null || origins.isBlank()) {
            // permissive default for developer experience; override in production profile
            config.setAllowedOriginPatterns(Collections.singletonList("*"));
        } else {
            String[] parts = origins.split(",");
            Arrays.stream(parts).map(String::trim).filter(s -> !s.isEmpty()).forEach(config::addAllowedOrigin);
        }
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Collections.singletonList("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    /**
     * Graceful shutdown: listen for ContextClosedEvent and drain backgroundExecutor before JVM exits.
     * For Kubernetes, also enable `server.shutdown=graceful` in application properties to let the embedded
     * server drain connections properly.
     */
    @Bean
    public ApplicationListener<ContextClosedEvent> gracefulShutdownListener() {
        return event -> {
            log.info("ContextClosedEvent received — starting graceful shutdown of background executor");
            backgroundExecutor.shutdown();
            try {
                if (!backgroundExecutor.awaitTermination(30, TimeUnit.SECONDS)) {
                    log.warn("Background executor didn't terminate in 30s — forcing shutdown");
                    backgroundExecutor.shutdownNow();
                }
            } catch (InterruptedException ex) {
                log.warn("Interrupted during graceful shutdown, forcing shutdown", ex);
                backgroundExecutor.shutdownNow();
                Thread.currentThread().interrupt();
            }
            log.info("Graceful shutdown finished");
        };
    }

    /**
     * Helper to submit short-lived background tasks via the managed executor. Prefer Spring's
     * TaskExecutor or @Async for production workloads; this helper is convenience for quick jobs.
     */
    public void submitBackgroundTask(Runnable task) {
        backgroundExecutor.submit(task);
    }

    /**
     * Global exception handler to centralize error responses and avoid leaking sensitive details.
     * For more advanced handling, create a dedicated @ControllerAdvice class per API group.
     */
    @ControllerAdvice
    public static class GlobalExceptionHandler {

        private final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

        @ExceptionHandler(Exception.class)
        public ResponseEntity<Object> handleGeneric(Exception ex) {
            log.error("Unhandled exception caught", ex);
            // Do not expose internal errors in production payloads
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "An unexpected error occurred"));
        }

        // Add handlers for specific exceptions (e.g., validation, access denied) as needed.
    }

    // TODO: Add beans for DB connectivity, caching, tracing (OpenTelemetry), Sentry, security filters, etc.

}
