export type Cut = { start: number; end: number };
export type CutPart = { kind: 'keep' | 'omit'; start: number; end: number; outputY: number; height: number };
export function cutPlan(height: number, cuts: Cut[], markerHeight = 28) {
  if (!Number.isInteger(height) || height < 1 || height > 20000) throw new Error('Image height must be between 1 and 20,000 pixels.');
  if (!Number.isInteger(markerHeight) || markerHeight < 0 || markerHeight > 200) throw new Error('Invalid marker height.');
  const sorted = cuts.map(c => {
    if (!Number.isInteger(c.start) || !Number.isInteger(c.end) || c.start < 0 || c.end > height || c.start >= c.end) throw new Error('Each cut needs a start below its end, within the original image.');
    return { ...c };
  }).sort((a, b) => a.start - b.start);
  const merged: Cut[] = [];
  for (const cut of sorted) { const last = merged.at(-1); if (last && cut.start <= last.end) last.end = Math.max(last.end, cut.end); else merged.push(cut); }
  const removed = merged.reduce((n, c) => n + c.end - c.start, 0);
  if (removed >= height) throw new Error('Keep at least one row of the original image.');
  const parts: CutPart[] = []; let cursor = 0, outputY = 0;
  for (const cut of merged) {
    if (cut.start > cursor) { parts.push({ kind: 'keep', start: cursor, end: cut.start, outputY, height: cut.start - cursor }); outputY += cut.start - cursor; }
    if (markerHeight) { parts.push({ kind: 'omit', ...cut, outputY, height: markerHeight }); outputY += markerHeight; }
    cursor = cut.end;
  }
  if (cursor < height) { parts.push({ kind: 'keep', start: cursor, end: height, outputY, height: height - cursor }); outputY += height - cursor; }
  if (outputY > 24000) throw new Error('The result is too tall. Use fewer cuts.');
  return { merged, parts, height: outputY, removed };
}
export function imageSizeError(width: number, height: number) { return width < 1 || height < 1 || width > 8000 || height > 20000 || width * height > 12000000 ? 'Use an image up to 8,000 px wide, 20,000 px tall, and 12 million pixels in total.' : ''; }
