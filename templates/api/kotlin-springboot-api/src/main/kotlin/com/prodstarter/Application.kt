package com.prodstarter

import io.micrometer.core.instrument.MeterRegistry
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
import org.springframework.context.event.ContextClosedEvent
import org.springframework.context.event.EventListener
import org.springframework.core.env.Environment
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.reactive.CorsWebFilter
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CommonsRequestLoggingFilter
import org.springframework.web.server.ResponseStatusException
import java.time.Duration
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

/**
 * ProdStarter — Spring Boot Application entrypoint
 *
 * Production-ready spring boot Kotlin application main file.
 * Features included/ready to wire:
 *  - Structured logging (SLF4J with Logback)
 *  - Micrometer metrics registration hook
 *  - Request logging filter (adjustable)
 *  - Global exception handler that avoids leaking internal details
 *  - Graceful shutdown helper (background executor drain)
 *  - CORS reactive filter configured from application properties
 *  - ConfigurationProperties scanning (for strongly-typed config classes)
 *  - Toggleable OpenAPI/Swagger (configure via application properties)
 *
 * Customize the TODO blocks to add DB, security, OAuth2/JWT, OpenTelemetry tracing, or any other integrations.
 */

@SpringBootApplication
@ConfigurationPropertiesScan
class Application {
    private val log = LoggerFactory.getLogger(Application::class.java)

    // A small thread pool to demonstrate graceful shutdown (for background tasks)
    private val backgroundExecutor: ExecutorService = Executors.newCachedThreadPool()

    /**
     * Example bean to register Micrometer meter customizations or tags for all metrics.
     * The MeterRegistry will be auto-configured by Spring Boot if Micrometer dependency is present.
     */
    @Bean
    fun configureMeters(registry: MeterRegistry, env: Environment): MeterRegistry {
        // Example: add common tags to all meters
        registry.config().commonTags("application", env.getProperty("spring.application.name", "prodstarter"),
            "environment", env.getProperty("spring.profiles.active", env.getProperty("spring.profiles.default", "default")))
        return registry
    }

    /**
     * Fine-grained request logging for debugging and audit. Disable or tune in production if noisy.
     * Uses CommonsRequestLoggingFilter (Servlet-based). For WebFlux, adapt to a reactive logging filter.
     */
    @Bean
    fun requestLoggingFilter(): CommonsRequestLoggingFilter {
        val filter = CommonsRequestLoggingFilter()
        filter.setIncludeClientInfo(true)
        filter.setIncludeQueryString(true)
        filter.setIncludePayload(false) // set true with payload limit for debug only
        filter.setMaxPayloadLength(1024)
        filter.setIncludeHeaders(false)
        return filter
    }

    /**
     * CORS configuration. In production, configure allowed origins via property `app.cors.allowed-origins`.
     */
    @Bean
    fun corsFilter(env: Environment): CorsWebFilter {
        val corsConfig = CorsConfiguration()
        val origins = env.getProperty("app.cors.allowed-origins")
        if (!origins.isNullOrBlank()) {
            origins.split(',').map { it.trim() }.forEach { corsConfig.addAllowedOrigin(it) }
        } else {
            // permissive default for local development — override in prod
            corsConfig.addAllowedOriginPattern("*")
        }
        corsConfig.allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        corsConfig.allowedHeaders = listOf("*")
        corsConfig.allowCredentials = true

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", corsConfig)
        return CorsWebFilter(source)
    }

    /**
     * Example: listen for application context close to perform graceful shutdown tasks.
     * For containers orchestrators (Kubernetes), enable `server.shutdown=graceful` in properties
     * and tune `spring.lifecycle.timeout-per-shutdown-phase` for longer drains.
     */
    @EventListener(ContextClosedEvent::class)
    fun onContextClosed(event: ContextClosedEvent) {
        log.info("ContextClosedEvent received — starting graceful shutdown of background executor")
        backgroundExecutor.shutdown()
        try {
            if (!backgroundExecutor.awaitTermination(30, TimeUnit.SECONDS)) {
                log.warn("Background executor didn't terminate in 30s — forcing shutdown")
                backgroundExecutor.shutdownNow()
            }
        } catch (ex: InterruptedException) {
            log.warn("Interrupted during graceful shutdown, forcing shutdown", ex)
            backgroundExecutor.shutdownNow()
            Thread.currentThread().interrupt()
        }
        log.info("Graceful shutdown finished")
    }

    /**
     * Helper to submit short-lived background tasks via the managed executor.
     * Use application-scoped task schedulers or Spring @Async (with Executor config) for production.
     */
    fun submitBackgroundTask(runnable: Runnable) {
        backgroundExecutor.submit(runnable)
    }

    /**
     * Global exception handler to centralize error responses and avoid leaking sensitive details.
     * For more advanced handling, create separate @ControllerAdvice classes per api-group.
     */
    @ControllerAdvice
    class GlobalExceptionHandler {
        private val log = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

        @ExceptionHandler(Exception::class)
        fun handleAny(ex: Exception): ResponseEntity<Map<String, Any>> {
            // Log full stack trace with structured logger
            log.error("Unhandled exception caught", ex)

            val body = mapOf(
                "error" to "internal_server_error",
                "message" to "An unexpected error occurred."
            )
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body)
        }

        @ExceptionHandler(ResponseStatusException::class)
        fun handleResponseStatus(ex: ResponseStatusException): ResponseEntity<Map<String, Any>> {
            val body = mapOf(
                "error" to ex.status.reasonPhrase?.lowercase()?.replace(" ", "_") ?: "error",
                "message" to (ex.reason ?: ex.message ?: "")
            )
            return ResponseEntity.status(ex.status).body(body)
        }
    }
}

fun main(args: Array<String>) {
    // Set a sensible default profile if none active — prefer 'prod' for releases
    val activeProfiles = System.getProperty("spring.profiles.active") ?: System.getenv("SPRING_PROFILES_ACTIVE")
    if (activeProfiles.isNullOrBlank()) {
        // default to 'production' for template release; developers can use 'dev' locally
        System.setProperty("spring.profiles.default", "production")
    }

    // Start the application
    runApplication<Application>(*args) {
        // Additional programmatic customizations can be set here.
        addInitializers()
    }
}
