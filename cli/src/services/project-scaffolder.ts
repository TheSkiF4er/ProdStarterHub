import path from "path";
import fs from "fs";
import fsExtra from "fs-extra";
import chalk from "chalk";
import { TemplateDescriptor } from "../commands/init";
import { logger as rootLogger } from "./logger";

const log = rootLogger.child("scaffolder");

export interface ScaffoldProjectOptions {
  /**
   * Template descriptor loaded from the registry.
   */
  template: TemplateDescriptor;

  /**
   * User-provided project name (also used in variable substitution).
   */
  projectName: string;

  /**
   * Absolute target directory where the project will be created.
   * The directory is created if it does not exist.
   */
  targetDir: string;

  /**
   * Overwrite files in a non-empty directory without asking.
   * (The interactive confirmation is handled in the `init` command.)
   */
  force?: boolean;

  /**
   * Extra variables available for template substitution.
   * These are merged on top of defaults (PROJECT_NAME, TEMPLATE_ID, etc.).
   */
  extraVars?: Record<string, string>;
}

/**
 * Main scaffolding entry point used by the `init` command.
 *
 * Responsibilities:
 *  - Resolve template root directory
 *  - Build template variable map
 *  - Recursively copy files/directories
 *  - Apply {{VARIABLE}} substitutions to text files
 *  - Handle common renames (e.g. _gitignore -> .gitignore)
 */
export async function scaffoldProject(options: ScaffoldProjectOptions): Promise<void> {
  const { template, projectName, targetDir } = options;

  log.debug(
    `Starting scaffolding for template "%s" into "%s"`,
    template.id,
    path.relative(process.cwd(), targetDir) || "."
  );

  const templateRoot = resolveTemplateRoot(template.path);
  if (!fs.existsSync(templateRoot)) {
    const msg = [
      `Template directory "${templateRoot}" does not exist.`,
      `Check the "path" field for template "${template.id}" in core/templates-registry.json.`,
    ].join(" ");
    log.error(msg);
    throw new Error(msg);
  }

  // Build the final variables map
  const vars = buildTemplateVariables({
    template,
    projectName,
    extraVars: options.extraVars,
  });

  // Ensure target directory exists
  await fsExtra.mkdirp(targetDir);

  // Copy everything recursively
  const entries = await fsExtra.readdir(templateRoot, { withFileTypes: true });
  await copyEntriesRecursive(entries, templateRoot, targetDir, vars);

  log.success(
    `Scaffolding complete for "%s" (template %s).`,
    projectName,
    template.id
  );
}

/* ============================================================================
 *  Template root resolution
 * ========================================================================== */

function resolveTemplateRoot(templatePath: string): string {
  // The registry path is usually relative to the repo root.
  // But when the CLI is installed as a package, templates may be shipped
  // alongside the CLI. We try a few sensible locations.

  const cwd = process.cwd();
  const fromCwd = path.resolve(cwd, templatePath);
  if (fs.existsSync(fromCwd)) {
    log.debug(`Template path resolved from CWD: %s`, fromCwd);
    return fromCwd;
  }

  // When compiled: dist/services/project-scaffolder.js → go up to package root
  const fromCliRoot = path.resolve(__dirname, "..", "..", templatePath);
  if (fs.existsSync(fromCliRoot)) {
    log.debug(`Template path resolved from CLI root: %s`, fromCliRoot);
    return fromCliRoot;
  }

  // Monorepo structure when CLI lives in ./cli and core/templates are siblings
  const fromMonorepoRoot = path.resolve(__dirname, "..", "..", "..", templatePath);
  if (fs.existsSync(fromMonorepoRoot)) {
    log.debug(`Template path resolved from monorepo root: %s`, fromMonorepoRoot);
    return fromMonorepoRoot;
  }

  // If nothing matches, return CWD-based and let caller error
  log.warn(
    `Template path "${templatePath}" could not be resolved from known bases. Using "%s" as a best guess.`,
    fromCwd
  );
  return fromCwd;
}

/* ============================================================================
 *  Variables
 * ========================================================================== */

interface BuildVarsInput {
  template: TemplateDescriptor;
  projectName: string;
  extraVars?: Record<string, string>;
}

/**
 * Build a set of variables for template substitution.
 *
 * These can be used inside template files as:
 *   {{ PROJECT_NAME }}
 *   {{ TEMPLATE_ID }}
 *   {{ YEAR }}
 *   etc.
 */
function buildTemplateVariables(input: BuildVarsInput): Record<string, string> {
  const now = new Date();
  const year = String(now.getFullYear());

  const defaults: Record<string, string> = {
    PROJECT_NAME: input.projectName,
    TEMPLATE_ID: input.template.id,
    TEMPLATE_NAME: input.template.name,
    TEMPLATE_TYPE: input.template.type,
    TEMPLATE_LANGUAGE: input.template.language,
    TEMPLATE_FRAMEWORK: input.template.framework ?? "",
    YEAR: year,
  };

  const extra = input.extraVars ?? {};

  const vars = {
    ...defaults,
    ...extra,
  };

  log.debug("Template variables: %O", vars);

  return vars;
}

/* ============================================================================
 *  Copy & substitution
 * ========================================================================== */

async function copyEntriesRecursive(
  entries: fs.Dirent[],
  srcRoot: string,
  destRoot: string,
  vars: Record<string, string>
): Promise<void> {
  await fsExtra.mkdirp(destRoot);

  for (const entry of entries) {
    const srcPath = path.join(srcRoot, entry.name);
    const destName = transformFilename(entry.name);
    const destPath = path.join(destRoot, destName);

    if (entry.isDirectory()) {
      const subEntries = await fsExtra.readdir(srcPath, { withFileTypes: true });
      await copyEntriesRecursive(subEntries, srcPath, destPath, vars);
    } else if (entry.isFile()) {
      await copyFileWithSubstitution(srcPath, destPath, vars);
    } else {
      // symlinks and others are ignored by default
      log.debug(`Skipping non-file, non-directory entry: %s`, srcPath);
    }
  }
}

/**
 * Some filenames cannot be committed directly or conflict with tooling.
 * Common convention: prefix with "_" in templates and rename on scaffold.
 *
 * Examples:
 *  _gitignore      → .gitignore
 *  _npmrc          → .npmrc
 *  _editorconfig   → .editorconfig
 */
function transformFilename(name: string): string {
  const mappings: Record<string, string> = {
    _gitignore: ".gitignore",
    _npmrc: ".npmrc",
    _editorconfig: ".editorconfig",
    _gitattributes: ".gitattributes",
  };

  if (Object.prototype.hasOwnProperty.call(mappings, name)) {
    return mappings[name];
  }

  return name;
}

async function copyFileWithSubstitution(
  srcPath: string,
  destPath: string,
  vars: Record<string, string>
): Promise<void> {
  const buffer = await fsExtra.readFile(srcPath);

  // Quick binary heuristic: if there's a NULL byte, treat as binary
  const contentStr = buffer.toString("utf8");
  const isTextLike = isTextFile(destPath, contentStr);

  if (!isTextLike) {
    await fsExtra.outputFile(destPath, buffer);
    log.debug(`Copied binary file: %s`, destPath);
    return;
  }

  const substituted = applyTemplateVariables(contentStr, vars);
  await fsExtra.outputFile(destPath, substituted, { encoding: "utf8" });
  log.debug(`Copied text file with substitutions: %s`, destPath);
}

/**
 * Very simple text-file heuristic:
 *  - checks extension
 *  - checks for NULL bytes
 */
function isTextFile(fileName: string, content: string): boolean {
  const textExtensions = [
    ".txt",
    ".md",
    ".markdown",
    ".json",
    ".jsonc",
    ".yaml",
    ".yml",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".cjs",
    ".mjs",
    ".map",
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".html",
    ".htm",
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
    ".sh",
    ".bash",
    ".zsh",
    ".ps1"
  ];

  const ext = path.extname(fileName).toLowerCase();
  if (textExtensions.includes(ext)) return true;

  const nullCount = (content.match(/\0/g) || []).length;
  return nullCount === 0;
}

/**
 * Replace occurrences of {{ VAR }} in file contents.
 *
 * Example:
 *   content: "Welcome to {{ PROJECT_NAME }}!"
 *   vars: { PROJECT_NAME: "my-app" }
 *   result: "Welcome to my-app!"
 */
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
 *  Developer note
 * ========================================================================== */

/**
 * In the future, this module can be extended to:
 *  - Support per-template hooks (pre/post scaffold)
 *  - Support "partial" templates or mixins
 *  - Integrate with an AI-powered customization layer
 *
 * For now, it implements a robust, predictable scaffolding process
 * that works well for most starter-template use cases.
 */

// Small, friendly message if this file is executed directly by accident.
if (require.main === module) {
  // eslint-disable-next-line no-console
  console.log(
    chalk.yellow(
      "This module is intended to be used by the ProdStarterHub CLI, not executed directly."
    )
  );
}
