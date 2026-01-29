import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get initials from name (first letters of first 2 words) or fallback to email first char.
 */
export function getInitials(name?: string | null, email?: string | null): string {
  const trimmed = (name || "").trim();
  if (trimmed) {
    return trimmed
      .split(/\s+/)
      .map((s) => s[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  const em = (email || "").trim();
  if (em) return em.charAt(0).toUpperCase();
  return "U";
}
