// ProdStarterHub - C++ gRPC Service
// src/main.cpp
// Production-ready gRPC server bootstrap with:
//  - graceful shutdown (SIGINT/SIGTERM)
//  - optional TLS configuration
//  - health checking (gRPC health probe service)
//  - reflection (for debugging with grpc_cli)
//  - structured logging via spdlog
//  - basic Prometheus metrics exposition (if enabled)
//  - thread pool / completion queue usage
//  - service registration placeholder
//
// Dependencies (add to your build system):
//  - gRPC (>=1.46)
//  - protobuf
//  - spdlog
//  - cxxopts (or any CLI parser) [optional]//  - prometheus-cpp (optional)
//
// Build notes: link with -lgrpc++ -lgrpc -lprotobuf and other required libs. Use C++17 or later.

#include <iostream>
#include <memory>
#include <string>
#include <thread>
#include <vector>
#include <atomic>
#include <csignal>

#include <grpcpp/grpcpp.h>
#include <grpcpp/ext/proto_server_reflection_plugin.h>
#include <grpcpp/health_check_service_interface.h>

#include <spdlog/spdlog.h>
#include <spdlog/sinks/stdout_color_sinks.h>

#ifdef USE_PROMETHEUS
#include <prometheus/exposer.h>
#include <prometheus/registry.h>
#endif

// Include your generated service headers
// #include "proto/myservice.grpc.pb.h"

using grpc::Server;
using grpc::ServerBuilder;
using grpc::ServerContext;
using grpc::Status;

// ---- Configuration struct ----
struct ServerConfig {
    std::string bind_address = "0.0.0.0:50051";
    bool enable_tls = false;
    std::string cert_chain_file;
    std::string private_key_file;
    std::string root_cert_file; // optional
    bool enable_reflection = true;
    bool enable_prometheus = false;
    int num_worker_threads = std::thread::hardware_concurrency();
};

// Global running flag for graceful shutdown
static std::atomic<bool> g_shutdown_requested{false};

// Signal handler -> sets the shutdown flag
static void signal_handler(int signum) {
    spdlog::warn("Signal {} received, requesting shutdown", signum);
    g_shutdown_requested.store(true);
}

// ---- Example of a minimal service implementation stub ----
// Replace ExampleService with your actual service
/*
class ExampleServiceImpl final : public myproto::Example::Service {
public:
    Status MyRpcMethod(ServerContext* ctx, const myproto::Request* req, myproto::Response* resp) override {
        spdlog::info("Received MyRpcMethod request");
        // TODO: implement business logic
        return Status::OK;
    }
};
*/

int main(int argc, char** argv) {
    // ---- Basic logging setup ----
    auto console = spdlog::stdout_color_mt("console");
    spdlog::set_default_logger(console);
    spdlog::set_level(spdlog::level::info); // default level
    spdlog::flush_on(spdlog::level::info);

    spdlog::info("Starting ProdStarter C++ gRPC service");

    // ---- Parse CLI / environment for simple config (minimal, replace with robust parser) ----
    ServerConfig cfg;
    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--bind" && i + 1 < argc) { cfg.bind_address = argv[++i]; }
        else if (arg == "--tls" ) { cfg.enable_tls = true; }
        else if (arg == "--cert" && i + 1 < argc) { cfg.cert_chain_file = argv[++i]; }
        else if (arg == "--key" && i + 1 < argc) { cfg.private_key_file = argv[++i]; }
        else if (arg == "--root" && i + 1 < argc) { cfg.root_cert_file = argv[++i]; }
        else if (arg == "--no-reflection") { cfg.enable_reflection = false; }
        else if (arg == "--prometheus") { cfg.enable_prometheus = true; }
        else if (arg == "--threads" && i + 1 < argc) { cfg.num_worker_threads = std::stoi(argv[++i]); }
        else if (arg == "--verbose") { spdlog::set_level(spdlog::level::debug); }
        else if (arg == "--help") {
            std::cout << "Usage: " << argv[0] << " [--bind host:port] [--tls --cert cert.pem --key key.pem] [--prometheus] [--threads N] [--verbose]" << std::endl;
            return 0;
        }
    }

    spdlog::info("Configuration: bind={}, tls={}, reflection={}, prometheus={}, threads={}",
                 cfg.bind_address, cfg.enable_tls, cfg.enable_reflection, cfg.enable_prometheus, cfg.num_worker_threads);

    // ---- Setup optional Prometheus exposer ----
#ifdef USE_PROMETHEUS
    std::unique_ptr<prometheus::Exposer> exposer;
    std::shared_ptr<prometheus::Registry> registry;
    if (cfg.enable_prometheus) {
        // prometheus-cpp exposes metrics over an HTTP endpoint. Choose port e.g., 9090 or embed in same port via proxy.
        const std::string prometheus_listen = "0.0.0.0:9090";
        try {
            exposer = std::make_unique<prometheus::Exposer>(prometheus_listen);
            registry = std::make_shared<prometheus::Registry>();
            exposer->RegisterCollectable(registry);
            spdlog::info("Prometheus metrics exposed on {}", prometheus_listen);
        } catch (const std::exception& ex) {
            spdlog::error("Failed to start Prometheus exposer: {}", ex.what());
        }
    }
#endif

    // ---- Build server
    ServerBuilder builder;

    // Set the max number of concurrent completion queues/threads by registering multiple async services or adjust thread pool
    // For simplicity we will let gRPC manage completion queues internally via Sync API and thread pool

    // TLS credentials if enabled
    if (cfg.enable_tls) {
        if (cfg.cert_chain_file.empty() || cfg.private_key_file.empty()) {
            spdlog::error("TLS enabled but cert or key file not provided");
            return 2;
        }
        std::string cert, key, root;
        try {
            std::ifstream cert_in(cfg.cert_chain_file);
            cert.assign((std::istreambuf_iterator<char>(cert_in)), std::istreambuf_iterator<char>());
            std::ifstream key_in(cfg.private_key_file);
            key.assign((std::istreambuf_iterator<char>(key_in)), std::istreambuf_iterator<char>());
            if (!cfg.root_cert_file.empty()) {
                std::ifstream root_in(cfg.root_cert_file);
                root.assign((std::istreambuf_iterator<char>(root_in)), std::istreambuf_iterator<char>());
            }
        } catch (const std::exception& ex) {
            spdlog::error("Failed to read TLS files: {}", ex.what());
            return 2;
        }
        grpc::SslServerCredentialsOptions ssl_opts;
        grpc::SslServerCredentialsOptions::PemKeyCertPair pkp{key, cert};
        ssl_opts.pem_key_cert_pairs.push_back(pkp);
        if (!root.empty()) ssl_opts.pem_root_certs = root;
        auto creds = grpc::SslServerCredentials(ssl_opts);
        builder.AddListeningPort(cfg.bind_address, creds);
    } else {
        builder.AddListeningPort(cfg.bind_address, grpc::InsecureServerCredentials());
    }

    // Register services
    // Example: register your service implementations here
    // ExampleServiceImpl service_impl;
    // builder.RegisterService(&service_impl);

    // gRPC health check service
    grpc::health::HealthCheckServiceInterface* health_service = grpc::health::HealthCheckServiceInterface::Get();
    builder.RegisterService(health_service);

    // Optional server reflection for grpc_cli / debugging
    if (cfg.enable_reflection) {
        grpc::reflection::InitProtoReflectionServerBuilderPlugin();
    }

    std::unique_ptr<Server> server(builder.BuildAndStart());

    if (!server) {
        spdlog::error("Failed to start gRPC server");
        return 1;
    }

    spdlog::info("gRPC server listening on {}", cfg.bind_address);

    // Mark health as SERVING
    health_service->SetServingStatus("", grpc::health::HealthCheckResponse::SERVING);

    // ---- Install signal handlers for graceful shutdown ----
    std::signal(SIGINT, signal_handler);
    std::signal(SIGTERM, signal_handler);

    // Optional: spawn worker threads to handle background tasks
    std::vector<std::thread> workers;
    workers.reserve(cfg.num_worker_threads);
    for (int i = 0; i < cfg.num_worker_threads; ++i) {
        workers.emplace_back([i]() {
            spdlog::debug("Worker thread {} started", i);
            // Worker loop placeholder — replace with queue consumers, periodic tasks, etc.
            while (!g_shutdown_requested.load()) {
                std::this_thread::sleep_for(std::chrono::milliseconds(200));
            }
            spdlog::debug("Worker thread {} exiting", i);
        });
    }

    // Main loop — wait for shutdown flag. Use server->Wait() for blocking if not managing threads.
    while (!g_shutdown_requested.load()) {
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }

    spdlog::info("Shutdown requested — initiating graceful stop");

    // Set health to NOT_SERVING
    health_service->SetServingStatus("", grpc::health::HealthCheckResponse::NOT_SERVING);

    // Ask server to shutdown and wait for in-flight rpcs to finish
    server->Shutdown(); // Initiates shutdown; existing rpcs continue
    // Optionally block until shutdown completed or until a timeout
    server->Wait();

    // Join worker threads
    for (auto& w : workers) {
        if (w.joinable()) w.join();
    }

    spdlog::info("Server shutdown complete");
    spdlog::shutdown();
    return 0;
}
