/**
 * Label colors aligned with backend (LabelsService.ALLOWED_COLORS).
 * We send `name` to the API and use `hex` for display.
 */
export const LABEL_COLORS = [
  { name: 'green', hex: '#61bd4f' },
  { name: 'yellow', hex: '#f2d600' },
  { name: 'orange', hex: '#ff9f1a' },
  { name: 'red', hex: '#eb5a46' },
  { name: 'purple', hex: '#c377e0' },
  { name: 'blue', hex: '#0079bf' },
  { name: 'sky', hex: '#00c2e0' },
  { name: 'lime', hex: '#51e898' },
  { name: 'pink', hex: '#ff78cb' },
  { name: 'black', hex: '#344563' },
] as const;

const NAME_TO_HEX: Record<string, string> = Object.fromEntries(
  LABEL_COLORS.map((c) => [c.name, c.hex])
);

/** Returns hex for display. If `color` is a known name, returns hex; otherwise returns `color` (legacy hex). */
export function getLabelDisplayColor(color: string | undefined | null): string {
  if (!color) return '#9ca3af';
  return NAME_TO_HEX[color] ?? color;
}
