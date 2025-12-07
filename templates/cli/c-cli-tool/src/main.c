/*
 * ProdStarterHub - C CLI Tool
 *
 * Production-ready example of `main.c` for a CLI tool template.
 * Features:
 *  - POSIX-compliant argument parsing with getopt_long
 *  - Subcommand dispatch pattern (help, version, run, config)
 *  - Environment-variable driven configuration and optional config file path
 *  - Structured logging minimal implementation (levels: ERROR,WARN,INFO,DEBUG)
 *  - Signal handling for graceful shutdown (SIGINT/SIGTERM)
 *  - Exit codes and consistent error handling
 *  - Clear TODO notes where you should wire your business logic or platform integrations
 *
 * Build:
 *   gcc -std=c11 -O2 -Wall -Wextra -pedantic -o prodcli main.c
 *
 * Run examples:
 *   ./prodcli --help
 *   ./prodcli version
 *   ./prodcli run --input file.txt --verbose
 *
 * This file is intentionally dependency-free to maximize portability. If you want
 * to use 3rd-party libraries (argp, toml, json), add them in the build system
 * and replace the relevant parsing sections.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <getopt.h>
#include <signal.h>
#include <errno.h>
#include <time.h>
#include <stdarg.h>
#include <unistd.h>

/* -------- configuration & metadata -------- */
#define APP_NAME "prodstarter-cli"
#define APP_VERSION "1.0.0"
#define APP_DESC "Production-ready C CLI template"

/* Exit codes (POSIX-like, but extendable) */
enum exit_code {
    EXIT_OK = 0,
    EXIT_GENERIC_ERROR = 1,
    EXIT_INVALID_ARGS = 2,
    EXIT_CONFIG_ERROR = 3,
    EXIT_RUNTIME_ERROR = 4,
    EXIT_INTERRUPTED = 130
};

/* -------- logging (very small structured logger) -------- */
typedef enum { LOG_ERROR = 0, LOG_WARN = 1, LOG_INFO = 2, LOG_DEBUG = 3 } log_level_t;
static log_level_t GLOBAL_LOG_LEVEL = LOG_INFO;

static const char *level_to_str(log_level_t lvl) {
    switch (lvl) {
        case LOG_ERROR: return "ERROR";
        case LOG_WARN:  return "WARN";
        case LOG_INFO:  return "INFO";
        case LOG_DEBUG: return "DEBUG";
        default: return "UNK";
    }
}

static void log_msg(log_level_t lvl, const char *fmt, ...) {
    if (lvl > GLOBAL_LOG_LEVEL) return;
    time_t t = time(NULL);
    struct tm tm;
    char ts[32];
    localtime_r(&t, &tm);
    strftime(ts, sizeof(ts), "%Y-%m-%dT%H:%M:%S%z", &tm);

    fprintf(stderr, "%s %s [%s]: ", ts, APP_NAME, level_to_str(lvl));
    va_list ap;
    va_start(ap, fmt);
    vfprintf(stderr, fmt, ap);
    va_end(ap);
    fprintf(stderr, "\n");
}

/* -------- global runtime state & graceful shutdown -------- */
static volatile sig_atomic_t g_terminate = 0;

static void handle_signal(int sig) {
    if (sig == SIGINT || sig == SIGTERM) {
        g_terminate = 1;
        log_msg(LOG_WARN, "signal received (%d) — requesting graceful shutdown", sig);
    }
}

static void install_signal_handlers(void) {
    struct sigaction sa;
    sa.sa_handler = handle_signal;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = 0;
    sigaction(SIGINT, &sa, NULL);
    sigaction(SIGTERM, &sa, NULL);
}

/* -------- simple config loader (ENV + optional file path) -------- */
struct config {
    char *input_path;
    int verbose; /* boolean */
    int metrics_enabled; /* example feature flag */
};

static void config_init(struct config *cfg) {
    cfg->input_path = NULL;
    cfg->verbose = 0;
    cfg->metrics_enabled = 0;
}

static void config_free(struct config *cfg) {
    if (cfg->input_path) free(cfg->input_path);
}

/* Minimal config parse: read ENV vars and optionally parse a simple key=value file
 * (no external parser dependency). The file format is: key=value per line, # comments allowed.
 */
static int config_load_from_file(struct config *cfg, const char *path) {
    if (!path) return 0;
    FILE *f = fopen(path, "r");
    if (!f) {
        log_msg(LOG_WARN, "could not open config file '%s': %s", path, strerror(errno));
        return -1;
    }
    char line[512];
    while (fgets(line, sizeof(line), f)) {
        char *s = line;
        while (*s == ' ' || *s == '\t') s++;
        if (*s == '#' || *s == '\n' || *s == '\0') continue;
        char *eq = strchr(s, '=');
        if (!eq) continue;
        *eq = '\0';
        char *k = s;
        char *v = eq + 1;
        // trim newline and spaces
        char *nl = strchr(v, '\n'); if (nl) *nl = '\0';
        // keys we recognize
        if (strcmp(k, "INPUT_PATH") == 0) {
            free(cfg->input_path);
            cfg->input_path = strdup(v);
        } else if (strcmp(k, "VERBOSE") == 0) {
            cfg->verbose = (strcmp(v, "1") == 0 || strcasecmp(v, "true") == 0);
        } else if (strcmp(k, "METRICS_ENABLED") == 0) {
            cfg->metrics_enabled = (strcmp(v, "1") == 0 || strcasecmp(v, "true") == 0);
        }
    }
    fclose(f);
    return 0;
}

static void config_load_from_env(struct config *cfg) {
    const char *env_input = getenv("INPUT_PATH");
    const char *env_verbose = getenv("VERBOSE");
    const char *env_metrics = getenv("METRICS_ENABLED");
    if (env_input) {
        free(cfg->input_path);
        cfg->input_path = strdup(env_input);
    }
    if (env_verbose) cfg->verbose = (strcmp(env_verbose, "1") == 0 || strcasecmp(env_verbose, "true") == 0);
    if (env_metrics) cfg->metrics_enabled = (strcmp(env_metrics, "1") == 0 || strcasecmp(env_metrics, "true") == 0);
}

/* -------- subcommands implementation (examples) -------- */
static int cmd_help(void) {
    printf("%s - %s\n", APP_NAME, APP_DESC);
    printf("Usage: %s <command> [options]\n", APP_NAME);
    printf("\nCommands:\n");
    printf("  help             Show this help\n");
    printf("  version          Show version\n");
    printf("  run [options]    Run the main action (see run --help)\n");
    printf("  config [file]    Print effective configuration (optional config file path)\n");
    printf("\nGlobal options:\n");
    printf("  -v, --verbose    Increase verbosity (can be repeated)\n");
    printf("  -h, --help       Show help for global options\n");
    return EXIT_OK;
}

static int cmd_version(void) {
    printf("%s %s\n", APP_NAME, APP_VERSION);
    return EXIT_OK;
}

/* run subcommand: handles its own options via getopt_long after skipping the 'run' arg */
static int cmd_run(int argc, char **argv, struct config *cfg) {
    /* default behavior: read cfg, perform work, respect cfg->verbose */
    static struct option longopts[] = {
        {"input", required_argument, NULL, 'i'},
        {"metrics", no_argument, NULL, 'm'},
        {"help", no_argument, NULL, 'h'},
        {0, 0, 0, 0}
    };

    int opt;
    opterr = 0; // we'll handle errors
    while ((opt = getopt_long(argc, argv, "i:mh", longopts, NULL)) != -1) {
        switch (opt) {
            case 'i':
                free(cfg->input_path);
                cfg->input_path = strdup(optarg);
                break;
            case 'm':
                cfg->metrics_enabled = 1;
                break;
            case 'h':
                printf("Usage: %s run [--input PATH] [--metrics]\n", APP_NAME);
                return EXIT_OK;
            case '?':
            default:
                fprintf(stderr, "Unknown run option or missing argument. Use '%s run --help'\n", APP_NAME);
                return EXIT_INVALID_ARGS;
        }
    }

    log_msg(LOG_INFO, "run: starting main action (input='%s', metrics=%d)", cfg->input_path ? cfg->input_path : "(none)", cfg->metrics_enabled);

    /* Example: open input file and process line by line; in real app replace this with useful work */
    if (cfg->input_path) {
        FILE *in = fopen(cfg->input_path, "r");
        if (!in) {
            log_msg(LOG_ERROR, "failed to open input '%s': %s", cfg->input_path, strerror(errno));
            return EXIT_RUNTIME_ERROR;
        }
        char buf[1024];
        while (!g_terminate && fgets(buf, sizeof(buf), in)) {
            // simulate processing
            if (cfg->verbose) log_msg(LOG_DEBUG, "processing: %s", buf);
            // perform domain logic here (TODO)
        }
        fclose(in);
    } else {
        /* simulate work loop until interrupted */
        for (int i = 0; i < 5 && !g_terminate; ++i) {
            log_msg(LOG_INFO, "working... step %d", i+1);
            sleep(1);
        }
    }

    if (g_terminate) {
        log_msg(LOG_WARN, "run: interrupted, shutting down early");
        return EXIT_INTERRUPTED;
    }

    log_msg(LOG_INFO, "run: completed successfully");
    return EXIT_OK;
}

static int cmd_config(int argc, char **argv, struct config *cfg) {
    const char *file = NULL;
    if (argc >= 2) file = argv[1];

    /* Load env first, then optional file (file overrides env) */
    config_load_from_env(cfg);
    if (file) config_load_from_file(cfg, file);

    printf("Effective configuration:\n");
    printf("  INPUT_PATH=%s\n", cfg->input_path ? cfg->input_path : "(unset)");
    printf("  VERBOSE=%d\n", cfg->verbose);
    printf("  METRICS_ENABLED=%d\n", cfg->metrics_enabled);
    return EXIT_OK;
}

/* -------- main dispatch and global option parsing -------- */
int main(int argc, char **argv) {
    if (argc < 2) {
        return cmd_help();
    }

    install_signal_handlers();

    struct config cfg;
    config_init(&cfg);

    /* Global options parsing (before subcommand) — support -v/--verbose and -h */
    int global_verbose = 0;
    int gi = 1;
    while (gi < argc && argv[gi][0] == '-') {
        if (strcmp(argv[gi], "-v") == 0 || strcmp(argv[gi], "--verbose") == 0) {
            global_verbose++;
            ++gi;
            continue;
        }
        if (strcmp(argv[gi], "-h") == 0 || strcmp(argv[gi], "--help") == 0) {
            return cmd_help();
        }
        break; // unknown global option: stop and let subcommand parse it
    }

    /* Map verbosity count to log level */
    if (global_verbose >= 2) GLOBAL_LOG_LEVEL = LOG_DEBUG;
    else if (global_verbose == 1) GLOBAL_LOG_LEVEL = LOG_INFO;
    else GLOBAL_LOG_LEVEL = LOG_WARN;
    cfg.verbose = (global_verbose > 0);

    /* Subcommand dispatch */
    const char *cmd = argv[1];
    int ret = EXIT_OK;
    if (strcmp(cmd, "help") == 0) {
        ret = cmd_help();
    } else if (strcmp(cmd, "version") == 0) {
        ret = cmd_version();
    } else if (strcmp(cmd, "run") == 0) {
        /* pass argc-1 and argv+1 so run() can parse its own flags with getopt_long */
        ret = cmd_run(argc - 1, argv + 1, &cfg);
    } else if (strcmp(cmd, "config") == 0) {
        ret = cmd_config(argc - 1, argv + 1, &cfg);
    } else {
        fprintf(stderr, "Unknown command: %s\n\n", cmd);
        ret = cmd_help();
    }

    config_free(&cfg);

    if (ret == EXIT_INTERRUPTED) return EXIT_INTERRUPTED;
    if (ret != EXIT_OK) log_msg(LOG_ERROR, "exiting with code %d", ret);
    return ret;
}
