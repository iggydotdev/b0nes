/**
 * b0nes Page Renderer
 * Generates complete HTML pages with meta tags, stylesheets, and scripts.
 */

/** Stylesheet descriptor (string URL or object with options) */
export type StylesheetInput = string | StylesheetDescriptor;

export interface StylesheetDescriptor {
  /** Stylesheet URL */
  href: string;
  /** Media query */
  media?: string;
  /** Cross-origin setting */
  crossOrigin?: string;
  /** Additional attributes */
  [key: string]: string | undefined;
}

/** Page metadata and configuration */
export interface PageMeta {
  /** Page title (appears in <title>) */
  title?: string;
  /** Meta description */
  description?: string;
  /** HTML lang attribute */
  lang?: string;
  /** Additional stylesheets to include */
  stylesheets?: StylesheetInput[];
  /** Additional <script> sources to include */
  scripts?: string[];
  /** Whether to include the b0nes client runtime (default: true) */
  interactive?: boolean;
  /** Current page path for resolving relative assets */
  currentPath?: string;
  /** Production bundle path */
  bundlePath?: string;
  /** Any additional meta tag properties */
  [key: string]: unknown;
}

/** Returns the base HTML document template string. */
export function document(): string;

/**
 * Renders a complete HTML page.
 *
 * @param content - Pre-composed HTML content for the page body
 * @param meta - Page metadata and configuration
 * @returns Complete HTML document string
 */
export function renderPage(content: string, meta?: PageMeta): string;

/**
 * Normalizes stylesheet configuration into a consistent array format.
 *
 * @param sheets - Stylesheet entries (strings or objects)
 * @returns Normalized stylesheet descriptors
 */
export function configureStylesheets(
  sheets: StylesheetInput[]
): StylesheetDescriptor[];
