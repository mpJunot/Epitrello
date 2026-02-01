/**
 * Safe string escaping utilities.
 * CodeQL: use regex with /g flag to replace ALL occurrences; string.replace("x", "y") only replaces the first.
 * Prefer a well-tested sanitization library when possible; use these only for simple, controlled cases.
 */

/**
 * Escapes single quotes by doubling them (SQL-style).
 * Uses regex with /g so every quote is escaped, not just the first.
 */
export function escapeSingleQuotes(value: string): string {
  return value.replace(/'/g, "''");
}
