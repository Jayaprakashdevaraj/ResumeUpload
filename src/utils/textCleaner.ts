/**
 * Utilities to clean and normalize resume text.
 *
 * Responsibilities:
 * - Normalize newlines
 * - Remove control characters
 * - Collapse extra whitespace
 * - Remove duplicate lines (case-insensitive)
 * - Optionally remove special symbols while preserving emails/phones
 */

export interface CleanOptions {
  removeSpecialChars?: boolean;
  dedupe?: boolean;
  removeEmptyLines?: boolean;
}

export function cleanText(raw: string, options?: CleanOptions): string {
  const opts: Required<CleanOptions> = {
    removeSpecialChars: true,
    dedupe: true,
    removeEmptyLines: true,
    ...(options || {}),
  };

  if (!raw) return "";

  // Normalize newlines to \n
  let s = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Remove non-printable control characters except newline and tab
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, "");

  // Replace tabs with a single space
  s = s.replace(/\t+/g, " ");

  // Split on one-or-more newlines to collapse multiple blank lines
  const lines = s.split(/\n+/);

  const seen = new Set<string>();
  const out: string[] = [];

  for (let line of lines) {
    // Collapse multiple internal whitespace to single space and trim
    line = line.replace(/\s+/g, " ").trim();

    if (opts.removeSpecialChars) {
      // Remove uncommon special characters while preserving common resume tokens
      // Keeps letters/numbers/whitespace and common punctuation used in emails/phones
      line = line.replace(/[^\w\s@.\-+(),:\/&;:%'#\[\]]+/g, "");
    }

    if (opts.removeEmptyLines && line === "") continue;

    const key = line.toLowerCase();
    if (opts.dedupe) {
      if (seen.has(key)) continue;
      seen.add(key);
    }

    out.push(line);
  }

  return out.join("\n");
}

export default cleanText;

