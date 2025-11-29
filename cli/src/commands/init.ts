import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import fsExtra from "fs-extra";
import ora from "ora";

export type TemplateType = "web" | "api" | "service" | "cli";

export type TemplateComplexity = "beginner" | "intermediate" | "advanced";

export type TemplateStatus = "experimental" | "alpha" | "beta" | "stable" | "deprecated";

export interface TemplateDescriptor {
  id: string;
  name: string;
  type: TemplateType;
  language: string;
  framework?: string;
  path: string;
  description?: string;
  features?: string[];
  recommendedFor?: string[];
  complexity?: TemplateComplexity;
  status?: TemplateStatus;
  minCliVersion?: string;
}

/**
 * Options passed to the `init` command.
 */
export interface InitOptions {
  template?: string;
  name?: string;
  directory?: string;
  force?: boolean;
  yes?: boolean; // skip confirmations
}

/**
 * Register the `init` command (project scaffolding) on a Commander program.
 */
export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Scaffold a new project from a ProdStarterHub template.")
    .option("-t, --template <id>", "Template ID (see `prodstarter list`)")
    .option("-n, --name <projectName>", "Project name / directory")
    .option(
      "-d, --directory <path>",
      "Base directory where the project directory will be created (default: current working directory)"
    )
    .option("-f, --force", "Overwrite target directory even if it is not empty")
    .option("-y, --yes", "Skip confirmation prompts where possible")
    .action(async (cmd: InitOptions) => {
      try {
        await runInit({
          template: cmd.template,
          name: cmd.name,
          directory: cmd.directory,
          force: cmd.force,
          yes: cmd.yes,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(chalk.red("Failed to initialize project:"));
        // eslint-disable-next-line no-console
        console.error(err instanceof Error ? err.message : err);
        process.exitCode = 1;
      }
    });
}

/**
 * Main implementation of the `init` command.
 * Orchestrates:
 *  - loading template registry
 *  - selecting a template (interactive or by ID)
 *  - selecting project name & target directory
 *  - scaffolding the project
 */
export async function runInit(options: InitOptions): Promise<void> {
  const spinner = ora();

  // 1. Load template registry
  spinner.start("Loading templates registry...");
  const templates = await loadTemplatesRegistry();
  spinner.succeed("Templates registry loaded.");

  if (!templates.length) {
    throw new Error(
      "No templates were found in the registry. Ensure core/templates-registry.json contains at least one template."
    );
  }

  // 2. Resolve template (by flag or interactive)
  const selectedTemplate = await resolveTemplate(templates, options.template);

  // 3. Resolve project name
  const projectName = await resolveProjectName(options.name);

  // 4. Resolve target directory
  const baseDir = options.directory ? path.resolve(options.directory) : process.cwd();
  const targetDir = path.resolve(baseDir, projectName);

  // 5. Check directory state & confirm overwrite if necessary
  await ensureTargetDirectory(targetDir, { force: options.force, yes: options.yes });

  // 6. Scaffold project
  spinner.start(
    `Scaffolding "${projectName}" from template "${selectedTemplate.id}" (${selectedTemplate.language}, ${selectedTemplate.type})...`
  );

  try {
    await scaffoldProject({
      template: selectedTemplate,
      projectName,
      targetDir,
      force: true,
      extraVars: {
        PROJECT_NAME: projectName,
      },
    });

    spinner.succeed(`Project "${projectName}" created successfully.`);

    printNextSteps(selectedTemplate, projectName, targetDir);
  } catch (error) {
    spinner.fail("Scaffolding failed.");
    throw error;
  }
}

/* ============================================================================
 *  Template selection
 * ========================================================================== */

async function resolveTemplate(
  templates: TemplateDescriptor[],
  templateId?: string
): Promise<TemplateDescriptor> {
  if (templateId) {
    const template = templates.find((t) => t.id === templateId);
    if (!template) {
      const availableIds = templates.map((t) => t.id).sort();
      const listPreview = availableIds.slice(0, 10);
      const extra = availableIds.length > listPreview.length ? "…" : "";

      throw new Error(
        [
          `Template with id "${templateId}" was not found in the registry.`,
          "",
          "Try one of these:",
          `  ${listPreview.join(", ")}${extra}`,
          "",
          "Run `prodstarter list` to see all available templates.",
        ].join("\n")
      );
    }
    return template;
  }

  // Interactive selection
  const choices = templates
    .slice()
    .sort((a, b) => a.type.localeCompare(b.type) || a.language.localeCompare(b.language) || a.name.localeCompare(b.name))
    .map((t) => ({
      name: formatTemplateChoiceLabel(t),
      value: t.id,
      short: t.id,
    }));

  const answer = await inquirer.prompt<{ templateId: string }>([
    {
      type: "list",
      name: "templateId",
      message: "Choose a template:",
      pageSize: Math.min(choices.length, 20),
      choices,
    },
  ]);

  const template = templates.find((t) => t.id === answer.templateId);
  if (!template) {
    throw new Error("Selected template could not be found. Please try again.");
  }
  return template;
}

function formatTemplateChoiceLabel(t: TemplateDescriptor): string {
  const parts: string[] = [t.name];

  const meta: string[] = [];
  if (t.type) meta.push(t.type);
  if (t.language) meta.push(t.language);
  if (t.framework) meta.push(t.framework);

  const metaStr = meta.length ? ` [${meta.join(" · ")}]` : "";

  const extras: string[] = [];
  if (t.status && t.status !== "stable") extras.push(t.status);
  if (t.complexity) extras.push(t.complexity);

  const extrasStr = extras.length ? ` (${extras.join(", ")})` : "";

  return `${parts.join("")}${metaStr}${extrasStr}`;
}

/* ============================================================================
 *  Project name & directory handling
 * ========================================================================== */

async function resolveProjectName(initialName?: string): Promise<string> {
  if (initialName && initialName.trim()) {
    return sanitizeProjectName(initialName.trim());
  }

  const answer = await inquirer.prompt<{ projectName: string }>([
    {
      type: "input",
      name: "projectName",
      message: "Project name:",
      default: "my-prodstarter-app",
      validate(input: string) {
        if (!input || !input.trim()) return "Project name cannot be empty.";
        if (!isValidDirectoryName(input.trim())) {
          return "Project name contains invalid characters. Avoid slashes and special characters.";
        }
        return true;
      },
    },
  ]);

  return sanitizeProjectName(answer.projectName.trim());
}

function sanitizeProjectName(name: string): string {
  // Make it filesystem-friendly, but not too opinionated:
  // - trim
  // - replace spaces with dashes
  // - remove most special characters
  const trimmed = name.trim();
  const dashed = trimmed.replace(/\s+/g, "-");
  const cleaned = dashed.replace(/[^a-zA-Z0-9._-]/g, "");
  return cleaned || "my-prodstarter-app";
}

function isValidDirectoryName(name: string): boolean {
  return !/[<>:"/\\|?*\0]/.test(name);
}

async function ensureTargetDirectory(
  targetDir: string,
  opts: { force?: boolean; yes?: boolean }
): Promise<void> {
  const exists = fs.existsSync(targetDir);

  if (!exists) {
    await fsExtra.mkdirp(targetDir);
    return;
  }

  const isEmpty = await isDirectoryEmpty(targetDir);

  if (isEmpty) {
    return;
  }

  if (opts.force || opts.yes) {
    return;
  }

  const answer = await inquirer.prompt<{ overwrite: boolean }>([
    {
      type: "confirm",
      name: "overwrite",
      message: `Target directory "${path.relative(process.cwd(), targetDir) || "."}" is not empty. Overwrite?`,
      default: false,
    },
  ]);

  if (!answer.overwrite) {
    throw new Error("Operation cancelled by user – target directory is not empty.");
  }
}

async function isDirectoryEmpty(targetDir: string): Promise<boolean> {
  try {
    const stat = await fsExtra.stat(targetDir);
    if (!stat.isDirectory()) {
      // Exists but is not a directory – treat as non-empty
      return false;
    }

    const files = await fsExtra.readdir(targetDir);
    // Ignore common noise
    const visible = files.filter((name) => ![".DS_Store", "Thumbs.db"].includes(name));
    return visible.length === 0;
  } catch {
    return true;
  }
}

/* ============================================================================
 *  Scaffolding
 * ========================================================================== */

interface ScaffoldOptions {
  template: TemplateDescriptor;
  projectName: string;
  targetDir: string;
  force?: boolean;
  extraVars?: Record<string, string>;
}

/**
 * High-level scaffolding function.
 * Delegates to a shared project-scaffolder service if available.
 *
 * This implementation assumes the following helper exists:
 *
 *   src/services/project-scaffolder.ts:
 *     export async function scaffoldProject(options: ScaffoldOptions): Promise<void>;
 *
 * If you prefer not to have a separate service file, you can inline a
 * simplified version of the logic below.
 */
async function scaffoldProject(options: ScaffoldOptions): Promise<void> {
  // We try to use a dedicated service if present to keep init.ts thin.
  // If the import fails (e.g. not yet implemented), we fall back to a basic scaffolder.
  let serviceScaffold: ((opts: ScaffoldOptions) => Promise<void>) | null = null;

  try {
    // Dynamically require so TypeScript consumers can refactor easily.
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const svc = require("../services/project-scaffolder") as {
      scaffoldProject?: (opts: ScaffoldOptions) => Promise<void>;
    };
    if (svc && typeof svc.scaffoldProject === "function") {
      serviceScaffold = svc.scaffoldProject;
    }
  } catch {
    // ignore, we'll use the fallback
  }

  if (serviceScaffold) {
    return serviceScaffold(options);
  }

  // Fallback: very simple file copier with basic variable substitution.
  await fallbackScaffoldProject(options);
}

/**
 * Fallback scaffolder for installations where a dedicated service is not yet available.
 * Copies files from the template path into the target directory and replaces {{VAR}} placeholders.
 */
async function fallbackScaffoldProject(opts: ScaffoldOptions): Promise<void> {
  const templateRoot = resolveTemplatePath(opts.template.path);
  const targetRoot = opts.targetDir;
  const vars = {
    PROJECT_NAME: opts.projectName,
    ...(opts.extraVars ?? {}),
  };

  if (!fs.existsSync(templateRoot)) {
    throw new Error(
      `Template directory "${templateRoot}" does not exist. Check 'path' in core/templates-registry.json for template "${opts.template.id}".`
    );
  }

  // Copy all files from templateRoot to targetRoot, applying substitutions to text files.
  const entries = await fsExtra.readdir(templateRoot, { withFileTypes: true });

  await copyEntriesRecursive(entries, templateRoot, targetRoot, vars);
}

function resolveTemplatePath(templatePath: string): string {
  // template.path is relative to project root in monorepo, but when the CLI is installed as a package,
  // we might ship templates together with the CLI under a different layout.
  // For now, we try a few reasonable bases:
  const cwd = process.cwd();
  const fromCwd = path.resolve(cwd, templatePath);

  if (fs.existsSync(fromCwd)) {
    return fromCwd;
  }

  const fromCliRoot = path.resolve(__dirname, "..", "..", templatePath);
  if (fs.existsSync(fromCliRoot)) {
    return fromCliRoot;
  }

  const fromMonorepoRoot = path.resolve(__dirname, "..", "..", "..", templatePath);
  if (fs.existsSync(fromMonorepoRoot)) {
    return fromMonorepoRoot;
  }

  // If nothing matches, return the most likely one (cwd-based) and let the caller error.
  return fromCwd;
}

async function copyEntriesRecursive(
  entries: fs.Dirent[],
  srcRoot: string,
  destRoot: string,
  vars: Record<string, string>
): Promise<void> {
  await fsExtra.mkdirp(destRoot);

  for (const entry of entries) {
    const srcPath = path.join(srcRoot, entry.name);
    const destPath = path.join(destRoot, entry.name);

    if (entry.isDirectory()) {
      const subEntries = await fsExtra.readdir(srcPath, { withFileTypes: true });
      await copyEntriesRecursive(subEntries, srcPath, destPath, vars);
    } else if (entry.isFile()) {
      const buffer = await fsExtra.readFile(srcPath);
      const content = buffer.toString("utf8");

      // Heuristic: only run substitution on text-like files
      const isTextLike = isTextFile(entry.name, content);
      if (isTextLike) {
        const replaced = applyTemplateVariables(content, vars);
        await fsExtra.outputFile(destPath, replaced, { encoding: "utf8" });
      } else {
        // binary-ish – copy as-is
        await fsExtra.copyFile(srcPath, destPath);
      }
    }
  }
}

function isTextFile(fileName: string, content: string): boolean {
  const textExtensions = [
    ".txt",
    ".md",
    ".json",
    ".yaml",
    ".yml",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".cjs",
    ".mjs",
    ".css",
    ".scss",
    ".html",
    ".xml",
    ".env",
    ".gitignore",
    ".gitattributes",
    ".editorconfig",
    ".cs",
    ".java",
    ".kt",
    ".go",
    ".py",
    ".php",
    ".rb",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
  ];

  const ext = path.extname(fileName).toLowerCase();
  if (textExtensions.includes(ext)) return true;

  // Fallback heuristic: look for many NULL bytes – likely binary.
  const nullCount = (content.match(/\0/g) || []).length;
  return nullCount === 0;
}

function applyTemplateVariables(content: string, vars: Record<string, string>): string {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    const pattern = new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, "g");
    result = result.replace(pattern, value);
  }
  return result;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ============================================================================
 *  Templates registry loading
 * ========================================================================== */

/**
 * Load templates from core/templates-registry.json.
 *
 * In a full implementation, this is typically delegated to a shared service
 * (e.g. src/services/template-registry.ts) that also performs schema validation.
 */
async function loadTemplatesRegistry(): Promise<TemplateDescriptor[]> {
  // We attempt to load via a dedicated service if it exists.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const svc = require("../services/template-registry") as {
      loadTemplatesRegistry?: () => Promise<TemplateDescriptor[]> | TemplateDescriptor[];
    };
    if (svc && typeof svc.loadTemplatesRegistry === "function") {
      const result = await svc.loadTemplatesRegistry();
      return Array.isArray(result) ? result : [];
    }
  } catch {
    // ignore and fall back to local loading logic
  }

  // Fallback: basic loader that assumes templates-registry.json is at core/templates-registry.json
  const candidatePaths = getTemplatesRegistryCandidatePaths();
  let foundPath: string | null = null;

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      foundPath = candidate;
      break;
    }
  }

  if (!foundPath) {
    throw new Error(
      [
        "Could not find core/templates-registry.json.",
        "Make sure you are using ProdStarterHub from the monorepo root or from a distribution that includes core & templates.",
      ].join("\n")
    );
  }

  const raw = await fsExtra.readFile(foundPath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(
      `Expected core/templates-registry.json to contain an array, but got ${typeof parsed}. Please fix the registry file.`
    );
  }

  // Minimal structural validation
  const templates: TemplateDescriptor[] = parsed
    .filter((entry: unknown) => entry && typeof entry === "object")
    .map((entry: any) => ({
      id: String(entry.id),
      name: String(entry.name),
      type: entry.type as TemplateType,
      language: String(entry.language),
      framework: entry.framework ? String(entry.framework) : undefined,
      path: String(entry.path),
      description: entry.description ? String(entry.description) : undefined,
      features: Array.isArray(entry.features) ? entry.features.map(String) : [],
      recommendedFor: Array.isArray(entry.recommendedFor) ? entry.recommendedFor.map(String) : [],
      complexity: entry.complexity as TemplateComplexity | undefined,
      status: (entry.status as TemplateStatus | undefined) ?? "alpha",
      minCliVersion: entry.minCliVersion ? String(entry.minCliVersion) : undefined,
    }));

  return templates;
}

function getTemplatesRegistryCandidatePaths(): string[] {
  const cwd = process.cwd();
  const fromCwd = path.resolve(cwd, "core", "templates-registry.json");
  const fromCliRoot = path.resolve(__dirname, "..", "..", "core", "templates-registry.json");
  const fromMonorepoRoot = path.resolve(__dirname, "..", "..", "..", "core", "templates-registry.json");

  const candidates: string[] = [fromCwd];

  if (!candidates.includes(fromCliRoot)) {
    candidates.push(fromCliRoot);
  }
  if (!candidates.includes(fromMonorepoRoot)) {
    candidates.push(fromMonorepoRoot);
  }

  return candidates;
}

/* ============================================================================
 *  UX helpers
 * ========================================================================== */

function printNextSteps(template: TemplateDescriptor, projectName: string, targetDir: string): void {
  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log(chalk.bold("Next steps:"));

  const relative = path.relative(process.cwd(), targetDir) || ".";
  // eslint-disable-next-line no-console
  console.log(`  cd ${relative}`);

  const hints = getStackHints(template);
  for (const hint of hints) {
    // eslint-disable-next-line no-console
    console.log(`  ${hint}`);
  }

  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log(
    chalk.dim(
      "Note: commands above are generic suggestions. For exact instructions, see the README.md inside the new project."
    )
  );
  // eslint-disable-next-line no-console
  console.log("");
}

function getStackHints(template: TemplateDescriptor): string[] {
  const hints: string[] = [];

  // Generic first step for almost all templates
  hints.push("# Check the template README for exact commands");

  const lang = template.language.toLowerCase();
  const type = template.type;

  if (["typescript", "javascript"].includes(lang)) {
    if (type === "web" || type === "api" || type === "service") {
      hints.push("pnpm install");
      hints.push("pnpm dev  # or pnpm start");
    } else if (type === "cli") {
      hints.push("pnpm install");
      hints.push("pnpm build");
      hints.push("node dist/index.js --help");
    }
  } else if (lang === "python") {
    hints.push("# Create & activate a virtualenv, then:");
    hints.push("pip install -r requirements.txt  # or use Poetry if provided");
    hints.push("# Run the app (see README for exact command, e.g. `uvicorn app.main:app --reload`)");
  } else if (lang === "go") {
    hints.push("go test ./...");
    if (type === "cli") {
      hints.push("go run ./cmd/cli");
    } else {
      hints.push("go run ./cmd/server");
    }
  } else if (lang === "php") {
    hints.push("composer install");
    hints.push("cp .env.example .env  # if present");
    hints.push("php artisan serve      # for Laravel projects");
  } else if (lang === "ruby") {
    hints.push("bundle install");
    hints.push("bin/rails db:prepare   # if using Rails");
    hints.push("bin/rails server");
  } else if (lang === "c#") {
    hints.push("dotnet restore");
    hints.push("dotnet run");
  } else if (lang === "java" || lang === "kotlin") {
    hints.push("./mvnw spring-boot:run  # or ./gradlew bootRun");
  } else if (lang === "c" || lang === "c++") {
    hints.push("# Build & run the binary for your platform (check README for details)");
  }

  return hints;
}
