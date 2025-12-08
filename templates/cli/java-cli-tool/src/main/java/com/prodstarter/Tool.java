package com.prodstarter;

import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Parameters;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/**
 * ProdStarterHub - Java CLI Tool
 *
 * Production-ready `Tool.java` implementing a robust CLI using picocli.
 * Features:
 *  - Subcommands (run, config, version, serve-metrics)
 *  - Structured logging via SLF4J (plug-in your logger of choice: Logback, log4j2)
 *  - Graceful shutdown via shutdown hook and cancellation
 *  - Simple built-in metrics/health HTTP server using com.sun.net.httpserver
 *  - Clear exit codes and error handling
 *
 * Notes:
 *  - This file expects Picocli and SLF4J on the classpath. Add dependencies in your build system:
 *      org.slf4j:slf4j-api
 *      info.picocli:picocli
 *  - For production logging use Logback or log4j2 implementation for SLF4J.
 */
@Command(name = "tool", mixinStandardHelpOptions = true, version = "1.0.0",
        description = "ProdStarter CLI — production-ready command-line tool")
public class Tool implements Callable<Integer> {
    private static final Logger log = LoggerFactory.getLogger(Tool.class);

    // global options
    @Option(names = {"-v", "--verbose"}, description = "Increase verbosity (use -vv for more)")
    boolean[] verbosity = new boolean[0];

    @Option(names = {"--config"}, description = "Path to configuration file (properties or YAML)")
    String configPath;

    public static void main(String[] args) {
        // bootstrap and run picocli
        int exitCode = new CommandLine(new Tool())
                .addSubcommand("run", new RunCommand())
                .addSubcommand("config", new ConfigCommand())
                .addSubcommand("version", new VersionCommand())
                .addSubcommand("serve-metrics", new MetricsCommand())
                .execute(args);

        System.exit(exitCode);
    }

    @Override
    public Integer call() {
        // default action: show usage
        CommandLine.usage(this, System.out);
        return ExitCodes.OK;
    }

    // ---- Exit codes ----
    public static final class ExitCodes {
        public static final int OK = 0;
        public static final int GENERIC_ERROR = 1;
        public static final int INVALID_ARGS = 2;
        public static final int CONFIG_ERROR = 3;
        public static final int RUNTIME_ERROR = 4;
        public static final int INTERRUPTED = 130;
    }

    // ---- Run subcommand ----
    @Command(name = "run", description = "Run main processing pipeline")
    static class RunCommand implements Callable<Integer> {
        @Option(names = {"-i", "--input"}, description = "Input file or resource")
        String input;

        @Option(names = {"--dry-run"}, description = "Run without persisting side effects")
        boolean dryRun = false;

        volatile boolean cancelled = false;

        @Override
        public Integer call() {
            final Logger logger = LoggerFactory.getLogger(RunCommand.class);
            logger.info("run: starting (input={}, dryRun={})", input, dryRun);

            // install shutdown hook for graceful cancellation
            Thread shutdownHook = new Thread(() -> {
                logger.warn("run: shutdown requested — signalling cancellation");
                cancelled = true;
            });
            Runtime.getRuntime().addShutdownHook(shutdownHook);

            try {
                // Example processing loop — replace with actual domain logic
                for (int i = 0; i < 10 && !cancelled; i++) {
                    logger.info("processing step {}", i + 1);
                    try {
                        Thread.sleep(500);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        logger.warn("interrupted during sleep");
                        cancelled = true;
                        break;
                    }
                }
                if (cancelled) {
                    logger.warn("run: cancelled, performing graceful shutdown tasks");
                    // perform minimal cleanup
                    return ExitCodes.INTERRUPTED;
                }
                logger.info("run: completed successfully");
                return ExitCodes.OK;
            } catch (Exception ex) {
                logger.error("run: unhandled error", ex);
                return ExitCodes.RUNTIME_ERROR;
            } finally {
                // remove shutdown hook if necessary — best-effort
                try {
                    Runtime.getRuntime().removeShutdownHook(shutdownHook);
                } catch (IllegalStateException ignored) {
                    // JVM is already shutting down
                }
            }
        }
    }

    // ---- Config subcommand ----
    @Command(name = "config", description = "Show effective configuration (env + file)")
    static class ConfigCommand implements Callable<Integer> {
        @Parameters(description = "Optional config file path", arity = "0..1")
        String file;

        @Override
        public Integer call() {
            Logger logger = LoggerFactory.getLogger(ConfigCommand.class);
            try {
                // Minimal: print environment variables and optionally file contents
                logger.info("config: printing effective configuration");
                System.out.println("Environment variables (selected):");
                System.getenv().entrySet().stream()
                        .filter(e -> e.getKey().startsWith("PROD_") || e.getKey().startsWith("APP_"))
                        .forEach(e -> System.out.printf("%s=%s\n", e.getKey(), e.getValue()));

                if (file != null) {
                    System.out.println("\nConfig file contents (" + file + "):");
                    java.nio.file.Files.lines(java.nio.file.Paths.get(file)).forEach(System.out::println);
                }
                return ExitCodes.OK;
            } catch (IOException ex) {
                logger.error("config: failed to read file", ex);
                return ExitCodes.CONFIG_ERROR;
            }
        }
    }

    // ---- Version subcommand ----
    @Command(name = "version", description = "Print version and build info")
    static class VersionCommand implements Callable<Integer> {
        @Override
        public Integer call() {
            String ver = System.getProperty("prodstarter.version", "0.0.0");
            String commit = System.getProperty("prodstarter.commit", "unknown");
            String when = System.getProperty("prodstarter.buildTime", "unknown");
            System.out.println(String.format("%s version=%s commit=%s built=%s", "prodstarter", ver, commit, when));
            return ExitCodes.OK;
        }
    }

    // ---- Metrics / health server subcommand ----
    @Command(name = "serve-metrics", description = "Serve simple metrics and health endpoints")
    static class MetricsCommand implements Callable<Integer> {
        @Option(names = {"--listen"}, description = "Address to listen on (host:port)")
        String listen = "0.0.0.0:9090";

        private HttpServer server;
        private ExecutorService httpExecutor;

        @Override
        public Integer call() {
            Logger logger = LoggerFactory.getLogger(MetricsCommand.class);
            logger.info("serve-metrics: starting on {}", listen);

            String[] parts = listen.split(":" , 2);
            String host = parts.length > 0 ? parts[0] : "0.0.0.0";
            int port = parts.length > 1 ? Integer.parseInt(parts[1]) : 9090;

            try {
                server = HttpServer.create(new InetSocketAddress(host, port), 0);
                httpExecutor = Executors.newFixedThreadPool(2);
                server.setExecutor(httpExecutor);

                server.createContext("/metrics", new MetricsHandler());
                server.createContext("/ready", new HealthyHandler("ready"));
                server.createContext("/live", new HealthyHandler("live"));

                server.start();

                // Add shutdown hook to stop server
                Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                    logger.info("serve-metrics: shutdown requested, stopping HTTP server");
                    MetricsCommand.this.stopServer();
                }));

                // block until interrupted
                logger.info("serve-metrics: server started; press CTRL+C to stop");
                Thread.currentThread().join();
                return ExitCodes.OK;
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                return ExitCodes.INTERRUPTED;
            } catch (IOException ex) {
                logger.error("serve-metrics: failed to start HTTP server", ex);
                return ExitCodes.RUNTIME_ERROR;
            } finally {
                stopServer();
            }
        }

        private void stopServer() {
            if (server != null) {
                server.stop(1);
            }
            if (httpExecutor != null) {
                httpExecutor.shutdown();
                try { httpExecutor.awaitTermination(2, TimeUnit.SECONDS); } catch (InterruptedException ignored) { }
            }
        }

        static class MetricsHandler implements HttpHandler {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                String body = "# HELP prodstater_requests_total Total processed requests\n" +
                        "prodstarter_requests_total 42\n";
                sendPlain(exchange, body);
            }
        }

        static class HealthyHandler implements HttpHandler {
            private final String text;
            HealthyHandler(String text) { this.text = text; }
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                sendPlain(exchange, text);
            }
        }

        static void sendPlain(HttpExchange exchange, String body) throws IOException {
            byte[] out = body.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "text/plain; charset=utf-8");
            exchange.sendResponseHeaders(200, out.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(out);
            }
        }
    }
}
