const PREFIX_REGEX = /^\s*(?:[-*]\s+|\d+[.)]\s+)/;
const MAX_LABEL_LENGTH = 100;

/**
 * Parse pasted text into an array of cleaned item labels.
 * - Splits on newlines
 * - Skips empty lines
 * - Strips list prefixes (-, *, 1., 2), etc.)
 * - Trims whitespace
 * - Truncates at 100 characters
 */
export function parseImportText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(PREFIX_REGEX, "").trim())
    .filter((line) => line.length > 0)
    .map((line) => (line.length > MAX_LABEL_LENGTH ? line.slice(0, MAX_LABEL_LENGTH) : line));
}
