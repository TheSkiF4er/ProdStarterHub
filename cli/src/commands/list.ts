import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import Table from "cli-table3";
import { TemplateDescriptor } from "./init";

/**
 * Register the `list` command on the Commander CLI program.
 * Lists all available templates from `core/templates-registry.json`,
 * with filtering and formatting options.
 */
export function registerListCommand(program: Command): void {
  program
    .command("list")
    .description("List available templates from the ProdStarterHub registry.")
    .option("-t, --type <type>", "Filter by template type (web, api, service, cli)")
    .option("-l, --language <language>", "Filter by language (e.g., typescript, python, go)")
    .option("--json", "Output raw JSON instead of formatted table")
    .option("--compact", "Compact view (less info per template)")
    .action(async (cmd: {
      type?: string;
      language?: string;
      json?: boolean;
      compact?: boolean;
    }) => {
      try {
        const templates = await loadTemplatesRegistry();

        if (!templates.length) {
          // eslint-disable-next-line no-console
          console.log(chalk.red("No templates found in core/templates-registry.json."));
          return;
        }

        const filtered = applyFilters(templates, {
          type: cmd.type,
          language: cmd.language,
        });

        if (cmd.json) {
          // eslint-disable-next-line no-console
          console.log(JSON.stringify(filtered, null, 2));
          return;
        }

        printTemplatesTable(filtered, { compact: cmd.compact });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(chalk.red("Failed to list templates:"), err instanceof Error ? err.message : err);
        process.exitCode = 1;
      }
    });
}

/* ============================================================================
 *  Load templates registry
 * ========================================================================== */

async function loadTemplatesRegistry(): Promise<TemplateDescriptor[]> {
  const candidatePaths = getTemplatesRegistryCandidatePaths();

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      const raw = await fs.promises.readFile(candidate, "utf8");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;

      return parsed.map((entry: any) => ({
        id: String(entry.id),
        name: String(entry.name),
        type: entry.type,
        language: entry.language,
        framework: entry.framework ?? "",
        path: entry.path,
        description: entry.description ?? "",
        features: Array.isArray(entry.features) ? entry.features.map(String) : [],
        recommendedFor: Array.isArray(entry.recommendedFor)
          ? entry.recommendedFor.map(String)
          : [],
        complexity: entry.complexity ?? "intermediate",
        status: entry.status ?? "alpha",
        minCliVersion: entry.minCliVersion ?? "0.1.0",
      }));
    }
  }

  throw new Error(
    "Could not find core/templates-registry.json. Make sure you are running from the monorepo root or a valid ProdStarterHub distribution."
  );
}

function getTemplatesRegistryCandidatePaths(): string[] {
  const cwd = process.cwd();
  const fromCwd = path.resolve(cwd, "core", "templates-registry.json");
  const fromCliRoot = path.resolve(__dirname, "..", "..", "core", "templates-registry.json");
  const fromMonorepoRoot = path.resolve(__dirname, "..", "..", "..", "core", "templates-registry.json");

  const candidates: string[] = [fromCwd];
  if (!candidates.includes(fromCliRoot)) candidates.push(fromCliRoot);
  if (!candidates.includes(fromMonorepoRoot)) candidates.push(fromMonorepoRoot);

  return candidates;
}

/* ============================================================================
 *  Filtering
 * ========================================================================== */

interface FilterOptions {
  type?: string;
  language?: string;
}

function applyFilters(
  templates: TemplateDescriptor[],
  opts: FilterOptions
): TemplateDescriptor[] {
  return templates.filter((t) => {
    if (opts.type && t.type.toLowerCase() !== opts.type.toLowerCase()) {
      return false;
    }
    if (opts.language && t.language.toLowerCase() !== opts.language.toLowerCase()) {
      return false;
    }
    return true;
  });
}

/* ============================================================================
 *  Output formatting
 * ========================================================================== */

interface PrintOptions {
  compact?: boolean;
}

function printTemplatesTable(
  templates: TemplateDescriptor[],
  opts: PrintOptions = {}
): void {
  if (!templates.length) {
    // eslint-disable-next-line no-console
    console.log(chalk.yellow("No templates match your filters."));
    return;
  }

  // Group templates by type (web/api/service/cli)
  const grouped = groupByType(templates);

  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log(chalk.bold.cyan("Available ProdStarterHub Templates"));
  // eslint-disable-next-line no-console
  console.log(chalk.dim("From core/templates-registry.json"));
  // eslint-disable-next-line no-console
  console.log("");

  for (const [type, group] of Object.entries(grouped)) {
    // eslint-disable-next-line no-console
    console.log(chalk.bold.underline(`Type: ${type}`));

    if (opts.compact) {
      printCompactTable(group);
    } else {
      printDetailedTable(group);
    }

    // eslint-disable-next-line no-console
    console.log("");
  }

  // eslint-disable-next-line no-console
  console.log(
    chalk.gray(
      `Total templates: ${templates.length} — use --type or --language to filter, or --json for raw output.`
    )
  );
  // eslint-disable-next-line no-console
  console.log("");
}

function groupByType(
  templates: TemplateDescriptor[]
): Record<string, TemplateDescriptor[]> {
  const map: Record<string, TemplateDescriptor[]> = {};
  for (const t of templates) {
    if (!map[t.type]) map[t.type] = [];
    map[t.type].push(t);
  }
  return map;
}

function printCompactTable(templates: TemplateDescriptor[]): void {
  const table = new Table({
    head: [chalk.gray("ID"), chalk.gray("Name"), chalk.gray("Lang"), chalk.gray("Framework")],
    style: { head: [], border: [] },
  });

  for (const t of templates) {
    table.push([
      chalk.cyan(t.id),
      t.name,
      chalk.magenta(t.language),
      chalk.dim(t.framework || "-"),
    ]);
  }

  // eslint-disable-next-line no-console
  console.log(table.toString());
}

function printDetailedTable(templates: TemplateDescriptor[]): void {
  const table = new Table({
    head: [
      chalk.gray("ID"),
      chalk.gray("Name"),
      chalk.gray("Language"),
      chalk.gray("Framework"),
      chalk.gray("Complexity"),
      chalk.gray("Status"),
      chalk.gray("Description"),
    ],
    wordWrap: true,
    colWidths: [22, 26, 14, 16, 14, 12, 50],
    style: { head: [], border: [] },
  });

  for (const t of templates) {
    const complexityColor = colorComplexity(t.complexity);
    const statusColor = colorStatus(t.status);
    table.push([
      chalk.cyan(t.id),
      t.name,
      chalk.magenta(t.language),
      chalk.dim(t.framework || "-"),
      complexityColor,
      statusColor,
      t.description || chalk.dim("(no description)"),
    ]);
  }

  // eslint-disable-next-line no-console
  console.log(table.toString());
}

function colorComplexity(c?: string): string {
  if (!c) return chalk.dim("-");
  switch (c) {
    case "beginner":
      return chalk.greenBright("beginner");
    case "intermediate":
      return chalk.yellowBright("intermediate");
    case "advanced":
      return chalk.redBright("advanced");
    default:
      return chalk.dim(c);
  }
}

function colorStatus(s?: string): string {
  if (!s) return chalk.dim("-");
  switch (s) {
    case "experimental":
      return chalk.redBright("experimental");
    case "alpha":
      return chalk.yellowBright("alpha");
    case "beta":
      return chalk.cyanBright("beta");
    case "stable":
      return chalk.greenBright("stable");
    case "deprecated":
      return chalk.gray("deprecated");
    default:
      return chalk.dim(s);
  }
}
