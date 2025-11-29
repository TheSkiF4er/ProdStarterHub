import { Command } from "commander";
import chalk from "chalk";
import { execSync } from "child_process";
import os from "os";
import fs from "fs";
import path from "path";

type CheckStatus = "ok" | "warn" | "error";

export interface DoctorCheck {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
  meta?: Record<string, unknown>;
}

export interface DoctorReport {
  ok: boolean;
  checks: DoctorCheck[];
  summary: string;
}

export interface DoctorOptions {
  json?: boolean;
}

/**
 * Minimum Node.js version for ProdStarterHub CLI.
 * Keep this in sync with:
 *  - .nvmrc
 *  - root package.json "engines.node"
 *  - cli/package.json "engines.node"
 */
const MIN_NODE_VERSION = {
  major: 18,
  minor: 18,
  patch: 0,
};

const CHECK_ICONS: Record<CheckStatus, string> = {
  ok: "✔",
  warn: "⚠",
  error: "✖",
};

/**
 * Main entry point for the `doctor` command logic.
 */
export async function runDoctor(options: DoctorOptions = {}): Promise<DoctorReport> {
  const checks: DoctorCheck[] = [];

  checks.push(checkNodeVersion());
  checks.push(checkPnpm());
  checks.push(checkGit());
  checks.push(checkDocker());
  checks.push(checkTemplatesRegistry());

  const hasError = checks.some((c) => c.status === "error");
  const hasWarn = checks.some((c) => c.status === "warn");

  let summary: string;
  if (!hasError && !hasWarn) {
    summary = "All critical checks passed. Your environment looks good for ProdStarterHub.";
  } else if (!hasError && hasWarn) {
    summary =
      "All critical checks passed, but there are some warnings. You can still use ProdStarterHub, but review the notes above.";
  } else {
    summary =
      "Some critical checks failed. ProdStarterHub may not work correctly until these issues are resolved.";
  }

  const report: DoctorReport = {
    ok: !hasError,
    checks,
    summary,
  };

  if (options.json) {
    // Machine-readable output
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHumanReadableReport(report);
  }

  return report;
}

/**
 * Register the `doctor` command on a Commander program instance.
 */
export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Run environment checks for ProdStarterHub (Node, pnpm, Git, Docker, templates registry).")
    .option("--json", "Output a JSON report instead of human-readable text.")
    .action(async (cmd: { json?: boolean }) => {
      try {
        await runDoctor({ json: cmd.json });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(chalk.red("Unexpected error while running doctor:"), err);
        process.exitCode = 1;
      }
    });
}

/* ============================================================================
 *  Individual checks
 * ========================================================================== */

function checkNodeVersion(): DoctorCheck {
  const raw = process.version; // e.g. "v18.18.0"
  const parsed = parseNodeVersion(raw);

  if (!parsed) {
    return {
      id: "node-version",
      label: "Node.js version",
      status: "warn",
      message: `Could not parse Node.js version from "${raw}". ProdStarterHub requires at least v${formatVersion(
        MIN_NODE_VERSION
      )}.`,
    };
  }

  const isOk = isVersionAtLeast(parsed, MIN_NODE_VERSION);
  const message = isOk
    ? `Node.js ${formatVersion(parsed)} detected.`
    : `Node.js ${formatVersion(
        parsed
      )} detected, but ProdStarterHub requires at least v${formatVersion(MIN_NODE_VERSION)}. Please upgrade Node.js.`;

  return {
    id: "node-version",
    label: "Node.js version",
    status: isOk ? "ok" : "error",
    message,
    meta: {
      current: formatVersion(parsed),
      minimum: formatVersion(MIN_NODE_VERSION),
      raw,
    },
  };
}

function checkPnpm(): DoctorCheck {
  try {
    const version = runCommand("pnpm", ["-v"]);

    if (!version) {
      return {
        id: "pnpm",
        label: "pnpm (monorepo package manager)",
        status: "warn",
        message:
          "pnpm not found in PATH. You can still use the CLI, but contributing to the monorepo is easier with pnpm installed.",
      };
    }

    return {
      id: "pnpm",
      label: "pnpm (monorepo package manager)",
      status: "ok",
      message: `pnpm ${version} detected.`,
      meta: { version },
    };
  } catch (error) {
    return {
      id: "pnpm",
      label: "pnpm (monorepo package manager)",
      status: "warn",
      message:
        "Could not determine pnpm version. You can still use the CLI, but working on the monorepo requires pnpm.",
    };
  }
}

function checkGit(): DoctorCheck {
  try {
    const version = runCommand("git", ["--version"]);

    if (!version) {
      return {
        id: "git",
        label: "Git",
        status: "error",
        message: "Git was not found in PATH. You need Git to clone and work with ProdStarterHub projects.",
      };
    }

    return {
      id: "git",
      label: "Git",
      status: "ok",
      message: version,
      meta: { version },
    };
  } catch {
    return {
      id: "git",
      label: "Git",
      status: "error",
      message: "Git was not found in PATH. Please install Git before using ProdStarterHub.",
    };
  }
}

function checkDocker(): DoctorCheck {
  try {
    const version = runCommand("docker", ["--version"]);

    if (!version) {
      return {
        id: "docker",
        label: "Docker (optional)",
        status: "warn",
        message:
          "Docker was not found. Many templates can still run, but database-backed templates are easier with Docker installed.",
      };
    }

    return {
      id: "docker",
      label: "Docker (optional)",
      status: "ok",
      message: version,
      meta: { version },
    };
  } catch {
    return {
      id: "docker",
      label: "Docker (optional)",
      status: "warn",
      message:
        "Docker was not found. Many templates can still run, but database-backed templates are easier with Docker installed.",
    };
  }
}

/**
 * Check that the templates registry is present and parsable.
 * This is a critical piece for the CLI to work properly.
 */
function checkTemplatesRegistry(): DoctorCheck {
  const candidates = getTemplatesRegistryCandidatePaths();
  let foundPath: string | null = null;

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      foundPath = candidate;
      break;
    }
  }

  if (!foundPath) {
    return {
      id: "templates-registry",
      label: "Templates registry (core/templates-registry.json)",
      status: "error",
      message:
        "Could not find core/templates-registry.json. The CLI will not be able to list or scaffold templates.\n" +
        "Make sure you are using a complete ProdStarterHub distribution (core + templates) or running from the monorepo root.",
      meta: { searchedPaths: candidates },
    };
  }

  try {
    const raw = fs.readFileSync(foundPath, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return {
        id: "templates-registry",
        label: "Templates registry (core/templates-registry.json)",
        status: "error",
        message:
          "core/templates-registry.json is not an array. The CLI expects an array of template descriptors. Please validate the file.",
        meta: { path: foundPath },
      };
    }

    const invalidEntries = parsed.filter(
      (entry: unknown) =>
        !entry ||
        typeof entry !== "object" ||
        typeof (entry as { id?: unknown }).id !== "string" ||
        typeof (entry as { path?: unknown }).path !== "string"
    );

    if (invalidEntries.length > 0) {
      return {
        id: "templates-registry",
        label: "Templates registry (core/templates-registry.json)",
        status: "warn",
        message:
          "core/templates-registry.json was found but some entries are missing required fields (id/path). " +
          "The CLI may not list or scaffold all templates correctly.",
        meta: {
          path: foundPath,
          totalEntries: parsed.length,
          invalidEntries: invalidEntries.length,
        },
      };
    }

    return {
      id: "templates-registry",
      label: "Templates registry (core/templates-registry.json)",
      status: "ok",
      message: `Found ${parsed.length} template entries at ${foundPath}.`,
      meta: {
        path: foundPath,
        totalEntries: parsed.length,
      },
    };
  } catch (error) {
    return {
      id: "templates-registry",
      label: "Templates registry (core/templates-registry.json)",
      status: "error",
      message:
        "Failed to read or parse core/templates-registry.json. The CLI will not be able to list or scaffold templates.",
      meta: {
        path: foundPath,
        error:
          error instanceof Error
            ? `${error.name}: ${error.message}`
            : "Unknown error while parsing registry.",
      },
    };
  }
}

/* ============================================================================
 *  Helpers
 * ========================================================================== */

function parseNodeVersion(raw: string): { major: number; minor: number; patch: number } | null {
  // Expected shape: "v18.18.0"
  const trimmed = raw.trim().replace(/^v/, "");
  const parts = trimmed.split(".");
  if (parts.length < 2) return null;

  const major = Number.parseInt(parts[0] ?? "", 10);
  const minor = Number.parseInt(parts[1] ?? "", 10);
  const patch = Number.parseInt(parts[2] ?? "0", 10);

  if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) {
    return null;
  }

  return { major, minor, patch };
}

function isVersionAtLeast(
  current: { major: number; minor: number; patch: number },
  minimum: { major: number; minor: number; patch: number }
): boolean {
  if (current.major > minimum.major) return true;
  if (current.major < minimum.major) return false;

  if (current.minor > minimum.minor) return true;
  if (current.minor < minimum.minor) return false;

  return current.patch >= minimum.patch;
}

function formatVersion(v: { major: number; minor: number; patch: number }): string {
  return `${v.major}.${v.minor}.${v.patch}`;
}

/**
 * Run a command and return stdout (trimmed) or null if the command is missing.
 */
function runCommand(command: string, args: string[]): string | null {
  try {
    const result = execSync([command, ...args].join(" "), {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    });
    return result.trim();
  } catch {
    return null;
  }
}

/**
 * Candidate paths for the templates registry.
 * We try to support both:
 *  - running from the monorepo root
 *  - running from an installed CLI package that includes core/ as a sibling of dist/
 */
function getTemplatesRegistryCandidatePaths(): string[] {
  const cwd = process.cwd();
  const fromCwd = path.resolve(cwd, "core", "templates-registry.json");

  // When compiled, dist/commands/doctor.js -> go up to package root and then into core/
  const fromDist = path.resolve(__dirname, "..", "..", "core", "templates-registry.json");

  // Fallback: monorepo structure when CLI is in ./cli
  const fromCliSibling = path.resolve(__dirname, "..", "..", "..", "core", "templates-registry.json");

  const candidates: string[] = [fromCwd];

  if (!candidates.includes(fromDist)) {
    candidates.push(fromDist);
  }
  if (!candidates.includes(fromCliSibling)) {
    candidates.push(fromCliSibling);
  }

  return candidates;
}

/**
 * Pretty-print a human-readable doctor report.
 */
function printHumanReadableReport(report: DoctorReport): void {
  // Header
  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log(chalk.bold("ProdStarterHub Doctor"));
  // eslint-disable-next-line no-console
  console.log(chalk.dim("Environment diagnostics for the ProdStarterHub CLI"));
  // eslint-disable-next-line no-console
  console.log("");

  // Basic environment info
  const platform = `${os.platform()} (${os.release()})`;
  const cpu = os.cpus()?.[0]?.model ?? "Unknown CPU";
  const nodeVersion = process.version;

  // eslint-disable-next-line no-console
  console.log(chalk.cyan("Environment"));
  // eslint-disable-next-line no-console
  console.log(`  OS:    ${platform}`);
  // eslint-disable-next-line no-console
  console.log(`  CPU:   ${cpu}`);
  // eslint-disable-next-line no-console
  console.log(`  Node:  ${nodeVersion}`);
  // eslint-disable-next-line no-console
  console.log("");

  // Checks
  // eslint-disable-next-line no-console
  console.log(chalk.cyan("Checks"));

  for (const check of report.checks) {
    const icon = CHECK_ICONS[check.status];
    const label = check.label;

    let line: string;
    if (check.status === "ok") {
      line = `${chalk.green(icon)} ${chalk.bold(label)} – ${check.message}`;
    } else if (check.status === "warn") {
      line = `${chalk.yellow(icon)} ${chalk.bold(label)} – ${check.message}`;
    } else {
      line = `${chalk.red(icon)} ${chalk.bold(label)} – ${check.message}`;
    }

    // eslint-disable-next-line no-console
    console.log(`  ${line}`);
  }

  // Summary
  // eslint-disable-next-line no-console
  console.log("");
  if (report.ok) {
    // eslint-disable-next-line no-console
    console.log(chalk.green.bold("Summary: "), report.summary);
  } else {
    // eslint-disable-next-line no-console
    console.log(chalk.red.bold("Summary: "), report.summary);
  }

  // eslint-disable-next-line no-console
  console.log("");
      }
