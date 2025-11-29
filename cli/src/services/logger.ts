import chalk from "chalk";

export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

export interface LoggerOptions {
  /**
   * Minimum level to log. Anything below this level will be ignored.
   * Defaults are resolved from environment variables:
   *
   *   - PRODTSTARTER_LOG_LEVEL
   *   - DEBUG (if set, implies "debug")
   */
  level?: LogLevel;

  /**
   * Optional prefix to prepend to all log messages.
   * Useful for namespacing (e.g., "init", "doctor", "scaffolder").
   */
  prefix?: string;

  /**
   * Whether to use colors in output. Defaults to true when TTY is detected.
   */
  useColors?: boolean;
}

const LOG_LEVEL_ORDER: LogLevel[] = ["silent", "error", "warn", "info", "debug"];

/**
 * Simple, opinionated logger for the ProdStarterHub CLI.
 *
 * - Honors log levels.
 * - Respects basic environment variables.
 * - Can be namespaced with prefixes (child loggers).
 */
export class Logger {
  private level: LogLevel;
  private prefix?: string;
  private useColors: boolean;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? resolveDefaultLogLevel();
    this.prefix = options.prefix;
    this.useColors = options.useColors ?? Boolean(process.stdout.isTTY);
  }

  /**
   * Create a new logger that inherits configuration, but has a different prefix.
   */
  public child(prefix: string): Logger {
    const mergedPrefix = this.prefix ? `${this.prefix}:${prefix}` : prefix;
    return new Logger({
      level: this.level,
      prefix: mergedPrefix,
      useColors: this.useColors,
    });
  }

  /* ==========================================================================
   *  Public logging methods
   * ========================================================================= */

  public error(message: string, ...args: unknown[]): void {
    this.logInternal("error", message, ...args);
  }

  public warn(message: string, ...args: unknown[]): void {
    this.logInternal("warn", message, ...args);
  }

  public info(message: string, ...args: unknown[]): void {
    this.logInternal("info", message, ...args);
  }

  public debug(message: string, ...args: unknown[]): void {
    this.logInternal("debug", message, ...args);
  }

  /**
   * Convenience method for success messages.
   * Uses `info` level, but with a success-style prefix.
   */
  public success(message: string, ...args: unknown[]): void {
    this.logInternal("info", message, ...args, { success: true });
  }

  /**
   * Low-level log method. If you need explicit control over level,
   * call this instead of the convenience helpers.
   */
  public log(level: LogLevel, message: string, ...args: unknown[]): void {
    this.logInternal(level, message, ...args);
  }

  /**
   * Get the current log level of this logger.
   */
  public getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Change the log level at runtime.
   */
  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  /* ==========================================================================
   *  Internal helpers
   * ========================================================================= */

  private logInternal(
    level: LogLevel,
    message: string,
    ...rest: unknown[]
  ): void {
    // Optional trailing metadata object for styling options.
    const maybeMeta = rest[rest.length - 1];
    let args = rest;
    let meta: { success?: boolean } = {};

    if (maybeMeta && typeof maybeMeta === "object" && !Array.isArray(maybeMeta)) {
      const m = maybeMeta as { success?: boolean };
      if ("success" in m) {
        meta = m;
        args = rest.slice(0, -1);
      }
    }

    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message, meta);

    // eslint-disable-next-line no-console
    if (level === "error") {
      console.error(formatted, ...args);
    } else if (level === "warn") {
      // eslint-disable-next-line no-console
      console.warn(formatted, ...args);
    } else {
      // eslint-disable-next-line no-console
      console.log(formatted, ...args);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const currentIdx = LOG_LEVEL_ORDER.indexOf(this.level);
    const incomingIdx = LOG_LEVEL_ORDER.indexOf(level);
    if (currentIdx === -1 || incomingIdx === -1) return false;
    if (this.level === "silent") return false;
    return incomingIdx <= currentIdx;
  }

  private formatMessage(level: LogLevel, message: string, meta: { success?: boolean }): string {
    const prefix = this.formatPrefix();
    const levelLabel = this.formatLevelLabel(level, meta);
    const msg = message;

    if (!this.useColors) {
      return [prefix, levelLabel, msg].filter(Boolean).join(" ");
    }

    return [prefix, levelLabel, msg].filter(Boolean).join(" ");
  }

  private formatPrefix(): string {
    if (!this.prefix) return "";
    if (!this.useColors) {
      return `[${this.prefix}]`;
    }
    return chalk.dim(`[${this.prefix}]`);
  }

  private formatLevelLabel(level: LogLevel, meta: { success?: boolean }): string {
    if (this.level === "silent") return "";

    const base = level.toUpperCase();

    if (!this.useColors) {
      if (meta.success) return `SUCCESS`;
      return base;
    }

    if (meta.success) {
      return chalk.green.bold("SUCCESS");
    }

    switch (level) {
      case "error":
        return chalk.red.bold(base);
      case "warn":
        return chalk.yellow.bold(base);
      case "info":
        return chalk.cyan.bold(base);
      case "debug":
        return chalk.magenta.bold(base);
      case "silent":
      default:
        return "";
    }
  }
}

/* ============================================================================
 *  Default logger instance
 * ========================================================================== */

/**
 * Resolve default log level from environment variables.
 *
 * Priority:
 *   1. PRODTSTARTER_LOG_LEVEL (silent|error|warn|info|debug)
 *   2. DEBUG (any truthy value implies "debug")
 *   3. Fallback: "info"
 */
function resolveDefaultLogLevel(): LogLevel {
  const envLevel = process.env.PRODTSTARTER_LOG_LEVEL?.toLowerCase().trim();
  const debugEnv = process.env.DEBUG;

  if (envLevel && isValidLogLevel(envLevel)) {
    return envLevel as LogLevel;
  }

  if (debugEnv && debugEnv !== "0" && debugEnv.toLowerCase() !== "false") {
    return "debug";
  }

  return "info";
}

function isValidLogLevel(value: string): value is LogLevel {
  return (LOG_LEVEL_ORDER as string[]).includes(value);
}

/**
 * Shared default logger used across the CLI.
 * You can import it directly:
 *
 *   import { logger } from "../services/logger";
 *
 * Or create a child logger with a prefix:
 *
 *   const log = logger.child("init");
 *   log.info("Scaffolding project...");
 */
export const logger = new Logger();
