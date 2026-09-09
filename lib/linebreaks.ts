export type JoinChoice = 'keep' | 'space' | 'tight';
export type TextParts = { lines: string[]; breaks: string[] };
export const MAX_CHARS = 20000;
export const MAX_BREAKS = 200;
export const EXAMPLE = 'Copy text from a PDF\nwithout fixing every line.\n\nKeep this paragraph separate.';
export function splitText(text: string): TextParts {
  const tokens = text.split(/(\r\n|\r|\n)/);
  return { lines: tokens.filter((_, i) => i % 2 === 0), breaks: tokens.filter((_, i) => i % 2 === 1) };
}
export function isParagraphEdge(parts: TextParts, index: number): boolean {
  return !parts.lines[index]?.trim() || !parts.lines[index + 1]?.trim();
}
export function renderText(parts: TextParts, choices: Record<number, JoinChoice>): string {
  return parts.lines.map((line, i) => {
    if (i >= parts.breaks.length) return line;
    const choice = isParagraphEdge(parts, i) ? 'keep' : choices[i] || 'keep';
    return line + (choice === 'space' ? ' ' : choice === 'tight' ? '' : parts.breaks[i]);
  }).join('');
}
