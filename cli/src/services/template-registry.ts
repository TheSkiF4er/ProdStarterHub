import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";
import { TemplateDescriptor, TemplateStatus, TemplateComplexity } from "../commands/init";
import { logger as rootLogger } from "./logger";

const log = rootLogger.child("template-registry");

export interface TemplateRegistryLocation {
  /**
   * Absolute path to the templates registry JSON file.
   */
  path: string;

  /**
   * True if the path actually exists on disk.
   */
  exists: boolean;

  /**
   * All paths that were considered when resolving the registry.
   */
  searchedPaths: string[];
}

export interface TemplateRegistryLoadOptions {
  /**
   * If true, do not log anything (useful for tests or JSON-only output).
   */
  silent?: boolean;

  /**
   * If true, basic structural validation errors will throw instead of
   * being logged and skipped.
   */
  strict?: boolean;
}

/**
 * Load templates from core/templates-registry.json, with:
 *  - multi-path resolution (monorepo, packaged CLI, CWD)
 *  - basic structural validation
 *  - graceful handling of invalid entries
 *
 * This is the canonical API used by CLI commands (`init`, `list`, etc.).
 */
export async function loadTemplatesRegistry(
  options: TemplateRegistryLoadOptions = {}
): Promise<TemplateDescriptor[]> {
  const location = resolveTemplatesRegistryLocation();

  if (!location.exists) {
    const message = [
      "Could not find core/templates-registry.json.",
      "Make sure you are:",
      "  - Running the CLI from a valid ProdStarterHub checkout or distribution, and",
      "  - The 'core' directory (with templates-registry.json) is present.",
      "",
      "Searched paths:",
      ...location.searchedPaths.map((p) => `  - ${p}`),
    ].join("\n");

    if (!options.silent) {
      log.error(message);
    }

    throw new Error(message);
  }

  const raw = await fsExtra.readFile(location.path, "utf8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const msg = `Failed to parse templates registry at ${location.path}: ${
      error instanceof Error ? error.message : String(error)
    }`;
    if (!options.silent) {
      log.error(msg);
    }
    throw new Error(msg);
  }

  if (!Array.isArray(parsed)) {
    const msg = `Expected templates registry at ${location.path} to contain an array, but got ${typeof parsed}.`;
    if (!options.silent) {
      log.error(msg);
    }
    throw new Error(msg);
  }

  const { valid, invalid } = validateAndNormalizeTemplates(parsed);

  if (!options.silent) {
    log.debug(
      "Loaded templates registry from %s (valid=%d, invalid=%d)",
      location.path,
      valid.length,
      invalid.length
    );
  }

  if (invalid.length && options.strict) {
    const msg = `Found ${invalid.length} invalid template entries in registry at ${location.path}.`;
    if (!options.silent) {
      log.error(msg);
    }
    throw new Error(msg);
  }

  if (invalid.length && !options.silent) {
    log.warn(
      "Some template entries were ignored due to missing required fields (id/path/name/type/language)."
    );
  }

  return valid;
}

/**
 * Resolve the most likely path to core/templates-registry.json.
 *
 * We try multiple locations to support:
 *  - running from monorepo root
 *  - running from inside cli/ in the monorepo
 *  - running from an installed CLI package that ships core/ alongside dist/
 */
export function resolveTemplatesRegistryLocation(): TemplateRegistryLocation {
  const candidates = getTemplatesRegistryCandidatePaths();
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return {
        path: candidate,
        exists: true,
        searchedPaths: candidates,
      };
    }
  }

  // If nothing exists, still return the first candidate as "preferred"
  return {
    path: candidates[0] ?? path.resolve(process.cwd(), "core", "templates-registry.json"),
    exists: false,
    searchedPaths: candidates,
  };
}

/**
 * Candidate paths for core/templates-registry.json.
 * Exported for debugging/testing.
 */
export function getTemplatesRegistryCandidatePaths(): string[] {
  const cwd = process.cwd();
  const fromCwd = path.resolve(cwd, "core", "templates-registry.json");

  // When compiled in CLI package:
  //   dist/services/template-registry.js -> go up to package root
  const fromCliRoot = path.resolve(__dirname, "..", "..", "core", "templates-registry.json");

  // Monorepo structure when CLI lives in ./cli and core is a sibling
  const fromMonorepoRoot = path.resolve(__dirname, "..", "..", "..", "core", "templates-registry.json");

  const candidates: string[] = [];

  if (!candidates.includes(fromCwd)) candidates.push(fromCwd);
  if (!candidates.includes(fromCliRoot)) candidates.push(fromCliRoot);
  if (!candidates.includes(fromMonorepoRoot)) candidates.push(fromMonorepoRoot);

  return candidates;
}

/* ============================================================================
 *  Validation & normalization
 * ========================================================================== */

interface ValidationResult {
  valid: TemplateDescriptor[];
  invalid: unknown[];
}

/**
 * Convert raw JSON entries into strongly-typed TemplateDescriptor objects
 * and collect invalid entries for logging or strict-error handling.
 */
function validateAndNormalizeTemplates(entries: unknown[]): ValidationResult {
  const valid: TemplateDescriptor[] = [];
  const invalid: unknown[] = [];

  for (const entry of entries) {
    const descriptor = toTemplateDescriptor(entry);
    if (descriptor) {
      valid.push(descriptor);
    } else {
      invalid.push(entry);
    }
  }

  return { valid, invalid };
}

function toTemplateDescriptor(entry: unknown): TemplateDescriptor | null {
  if (!entry || typeof entry !== "object") return null;

  const anyEntry = entry as Record<string, unknown>;

  const id = stringOrNull(anyEntry.id);
  const name = stringOrNull(anyEntry.name);
  const type = stringOrNull(anyEntry.type) as TemplateDescriptor["type"] | null;
  const language = stringOrNull(anyEntry.language);
  const framework = stringOrNull(anyEntry.framework);
  const templatePath = stringOrNull(anyEntry.path);

  if (!id || !name || !type || !language || !templatePath) {
    log.debug(
      "Ignoring invalid template entry (missing required fields): %O",
      { id, name, type, language, path: templatePath }
    );
    return null;
  }

  const features = arrayOfStrings(anyEntry.features);
  const recommendedFor = arrayOfStrings(anyEntry.recommendedFor);
  const description = stringOrNull(anyEntry.description) ?? undefined;
  const complexity = normalizeComplexity(anyEntry.complexity);
  const status = normalizeStatus(anyEntry.status);
  const minCliVersion = stringOrNull(anyEntry.minCliVersion) ?? undefined;

  const descriptor: TemplateDescriptor = {
    id,
    name,
    type,
    language,
    framework: framework ?? undefined,
    path: templatePath,
    description,
    features,
    recommendedFor,
    complexity,
    status,
    minCliVersion,
  };

  return descriptor;
}

function stringOrNull(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return null;
}

function arrayOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((x) => typeof x === "string")
    .map((x) => (x as string).trim())
    .filter(Boolean);
}

function normalizeComplexity(value: unknown): TemplateComplexity | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.toLowerCase().trim() as TemplateComplexity;
  if (v === "beginner" || v === "intermediate" || v === "advanced") {
    return v;
  }
  return undefined;
}

function normalizeStatus(value: unknown): TemplateStatus {
  if (typeof value !== "string") return "alpha";
  const v = value.toLowerCase().trim() as TemplateStatus;
  switch (v) {
    case "experimental":
    case "alpha":
    case "beta":
    case "stable":
    case "deprecated":
      return v;
    default:
      return "alpha";
  }
}

/* ============================================================================
 *  Convenience helpers
 * ========================================================================== */

/**
 * Lookup a single template by id.
 * Throws if not found when `required` is true, otherwise returns null.
 */
export async function findTemplateById(
  id: string,
  options: TemplateRegistryLoadOptions & { required?: boolean } = {}
): Promise<TemplateDescriptor | null> {
  const templates = await loadTemplatesRegistry(options);
  const template = templates.find((t) => t.id === id) ?? null;

  if (!template && options.required) {
    const msg = `Template with id "${id}" not found in templates registry.`;
    if (!options.silent) {
      log.error(msg);
    }
    throw new Error(msg);
  }

  return template;
}

/**
 * Filter templates by simple criteria (type, language).
 * Handy for tests or advanced CLI flows.
 */
export async function filterTemplates(
  criteria: {
    type?: TemplateDescriptor["type"];
    language?: string;
  },
  options: TemplateRegistryLoadOptions = {}
): Promise<TemplateDescriptor[]> {
  const templates = await loadTemplatesRegistry(options);
  const { type, language } = criteria;

  return templates.filter((t) => {
    if (type && t.type !== type) return false;
    if (language && t.language.toLowerCase() !== language.toLowerCase()) return false;
    return true;
  });
}

/* ============================================================================
 *  Developer note
 * ========================================================================== */

/**
 * This module intentionally focuses on:
 *  - reliable resolution of the templates registry location
 *  - thin validation and normalization into TemplateDescriptor objects
 *
 * Future enhancements might include:
 *  - JSON Schema validation against core/templates-schema/template.schema.json
 *  - richer filtering and query APIs
 *  - caching and invalidation strategies for long-running CLI processes
 */

// Friendly message if executed directly.
if (require.main === module) {
  // eslint-disable-next-line no-console
  console.log(
    chalk.yellow(
      "This module is intended to be imported by the ProdStarterHub CLI, not executed directly."
    )
  );

  // Small debug: try to resolve and print basic info.
  try {
    const location = resolveTemplatesRegistryLocation();
    // eslint-disable-next-line no-console
    console.log("Registry location:", location);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error resolving registry:", error);
  }
}
