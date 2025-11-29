#!/usr/bin/env node
/* eslint-disable no-console */

import { Command } from "commander";
import chalk from "chalk";
import path from "path";
import { registerInitCommand } from "./commands/init";
import { registerListCommand } from "./commands/list";
import { registerDoctorCommand } from "./commands/doctor";
import { logger } from "./services/logger";

// Import package.json via TypeScript's resolveJsonModule
// eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
const pkg = require("../package.json") as {
  name?: string;
  version?: string;
  description?: string;
};

const program = new Command();

/**
 * Setup basic CLI metadata.
 */
program
  .name("prodstarter")
  .description(
    pkg.description ||
      "ProdStarterHub CLI – scaffold production-ready starter templates for modern stacks."
  )
  .version(pkg.version || "0.0.0", "-v, --version", "Show the current CLI version")
  .usage("<command> [options]");

/**
 * Global options (can be extended later).
 */
program
  .option(
    "--log-level <level>",
    "Log level (silent, error, warn, info, debug)",
    (value: string) => value.toLowerCase(),
    process.env.PRODTSTARTER_LOG_LEVEL || "info"
  )
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts<{ logLevel?: string }>();
    const level = (opts.logLevel || "info").toLowerCase();

    // Narrow type a bit; logger will ignore invalid values.
    if (["silent", "error", "warn", "info", "debug"].includes(level)) {
      logger.setLevel(level as any);
    }

    logger.debug("CLI starting with options: %O", opts);
  });

/**
 * Register subcommands.
 */
registerInitCommand(program);
registerListCommand(program);
registerDoctorCommand(program);

/**
 * Handle unknown commands with a friendly message.
 */
program.on("command:*", (operands: string[]) => {
  const unknown = operands[0];
  console.error(
    chalk.red(`Unknown command: ${unknown ? `"${unknown}"` : "(none)"}`)
  );
  console.error("");
  console.error("Available commands:");
  program.commands.forEach((cmd) => {
    console.error(`  ${cmd.name()}  -  ${cmd.summary() || cmd.description()}`);
  });
  console.error("");
  console.error(`Run ${chalk.cyan("prodstarter --help")} for usage.`);
  process.exitCode = 1;
});

/**
 * Top-level error handling for async actions.
 */
function setupGlobalErrorHandlers(): void {
  process.on("uncaughtException", (err) => {
    console.error(chalk.red("Uncaught exception in ProdStarterHub CLI:"));
    console.error(formatError(err));
    process.exitCode = 1;
  });

  process.on("unhandledRejection", (reason) => {
    console.error(chalk.red("Unhandled promise rejection in ProdStarterHub CLI:"));
    console.error(formatError(reason));
    process.exitCode = 1;
  });
}

function formatError(err: unknown): string {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}\n${err.stack ?? ""}`;
  }
  try {
    return JSON.stringify(err, null, 2);
  } catch {
    return String(err);
  }
}

/**
 * Entry point.
 */
async function main(): Promise<void> {
  setupGlobalErrorHandlers();

  // If the CLI is invoked with no arguments, show help by default.
  if (process.argv.length <= 2) {
    program.outputHelp();
    return;
  }

  await program.parseAsync(process.argv);
}

// If this file is executed directly (as a script), run main().
if (require.main === module) {
  main().catch((err) => {
    console.error(chalk.red("Fatal error in ProdStarterHub CLI:"));
    console.error(formatError(err));
    process.exitCode = 1;
  });
}

/**
 * Export program for testing or embedding the CLI.
 */
export { program };
