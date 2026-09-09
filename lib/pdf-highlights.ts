export type Box = { x1: number; y1: number; x2: number; y2: number };
export type TextUnit = { text: string; box: Box | null };
export type TextIndex = { text: string; units: TextUnit[]; map: number[] };
export type Transfer = { page: number; boxes: Box[]; quote: string };
export function padBoxes(boxes: Box[], left: number, right = left) {
  if (![left, right].every(v => Number.isFinite(v) && v >= 0 && v <= 6)) throw new Error('Horizontal padding must be between 0 and 6 points.');
  return boxes.map(b => ({ ...b, x1: b.x1 - left, x2: b.x2 + right }));
}
export function normalizeQuote(text: string) { return text.replace(/\s+/g, ' ').trim(); }
export function indexUnits(units: TextUnit[]): TextIndex {
  let text = ''; const map: number[] = [];
  units.forEach((u, i) => { for (const ch of u.text) { if (/\s/u.test(ch)) { if (text && !text.endsWith(' ')) { text += ' '; map.push(i); } } else { text += ch; for (let k = 0; k < ch.length; k++) map.push(i); } } });
  if (text.endsWith(' ')) { text = text.slice(0, -1); map.pop(); }
  return { text, units, map };
}
export function occurrences(haystack: string, quote: string) {
  const needle = normalizeQuote(quote); if (!needle || needle.length < 3) return [];
  const found: number[] = []; let at = haystack.indexOf(needle);
  while (at !== -1 && found.length < 101) { found.push(at); at = haystack.indexOf(needle, at + 1); } return found;
}
export function mergeBoxes(boxes: Box[]) {
  const merged: Box[] = [];
  for (const b of boxes) { const p = merged.at(-1); const h = b.y2 - b.y1; if (p && Math.abs(p.y1 - b.y1) < Math.max(1, h * .18) && Math.abs(p.y2 - b.y2) < Math.max(1, h * .18) && b.x1 >= p.x1 && b.x1 <= p.x2 + Math.max(2, h * .7)) { p.x2 = Math.max(p.x2, b.x2); p.y1 = Math.min(p.y1, b.y1); p.y2 = Math.max(p.y2, b.y2); } else merged.push({ ...b }); } return merged;
}
export function rangeBoxes(index: TextIndex, start: number, length: number) { const ids = [...new Set(index.map.slice(start, start + length))]; return mergeBoxes(ids.flatMap(i => index.units[i].box ? [index.units[i].box!] : [])); }
export function quoteInBoxes(units: TextUnit[], boxes: Box[]) {
  let text = '', gap = '', lastSelected = false, fragmented = false;
  for (const u of units) { const b = u.box; const selected = b && boxes.some(q => (b.x1 + b.x2) / 2 >= q.x1 && (b.x1 + b.x2) / 2 <= q.x2 && (b.y1 + b.y2) / 2 >= q.y1 && (b.y1 + b.y2) / 2 <= q.y2);
    if (selected) { if (lastSelected) { if (/\S/.test(gap)) { text += ' '; fragmented = true; } else text += gap; } text += u.text; gap = ''; lastSelected = true; } else if (lastSelected) gap += u.text;
  } return { quote: normalizeQuote(text), fragmented };
}
export function quadBoxes(points: ArrayLike<number> | undefined): Box[] {
  if (!points || !points.length || points.length % 8 || points.length > 800) return [];
  const out: Box[] = []; for (let i = 0; i < points.length; i += 8) { const q = Array.from(points).slice(i, i + 8); if (q.some(n => !Number.isFinite(n))) return []; if (Math.abs(q[1] - q[3]) > .5 || Math.abs(q[5] - q[7]) > .5) return []; const xs = [q[0], q[2], q[4], q[6]], ys = [q[1], q[3], q[5], q[7]]; const box = { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) }; if (box.x1 >= box.x2 || box.y1 >= box.y2) return []; out.push(box); } return out;
}
export async function writeHighlights(bytes: Uint8Array, transfers: Transfer[]) {
  const { PDFDocument, PDFName, PDFHexString } = await import('pdf-lib'); const pdf = await PDFDocument.load(bytes.slice());
  if (pdf.isEncrypted) throw new Error('Encrypted PDFs are not supported.');
  if (!transfers.length || transfers.length > 100) throw new Error('Select between 1 and 100 highlights.');
  transfers.forEach((t, i) => {
    if (t.page < 1 || t.page > pdf.getPageCount() || !t.boxes.length || t.boxes.some(b => Object.values(b).some(n => !Number.isFinite(n)) || b.x2 <= b.x1 || b.y2 <= b.y1)) throw new Error('A highlight has invalid page coordinates.');
    const x = Math.min(...t.boxes.map(b => b.x1)), y = Math.min(...t.boxes.map(b => b.y1)), right = Math.max(...t.boxes.map(b => b.x2)), top = Math.max(...t.boxes.map(b => b.y2));
    const content = ['q /GS0 gs 1 0.85 0 rg', ...t.boxes.map(b => `${b.x1 - x} ${b.y1 - y} ${b.x2 - b.x1} ${b.y2 - b.y1} re f`), 'Q'].join('\n');
    const appearance = pdf.context.flateStream(content, { Type: 'XObject', Subtype: 'Form', BBox: [0, 0, right - x, top - y], Resources: { ExtGState: { GS0: { Type: 'ExtGState', BM: 'Multiply', ca: .35, CA: .35 } } } });
    const annotation = pdf.context.obj({ Type: 'Annot', Subtype: 'Highlight', Rect: [x, y, right, top], QuadPoints: t.boxes.flatMap(b => [b.x1, b.y2, b.x2, b.y2, b.x1, b.y1, b.x2, b.y1]), C: [1, .85, 0], CA: .35, F: 4, Border: [0, 0, 0], NM: PDFHexString.fromText(`HWANSEEK-${i + 1}`), T: PDFHexString.fromText('HWANSEEK reviewed transfer'), Contents: PDFHexString.fromText(t.quote), AP: { N: pdf.context.register(appearance) } });
    annotation.set(PDFName.of('P'), pdf.getPage(t.page - 1).ref); pdf.getPage(t.page - 1).node.addAnnot(pdf.context.register(annotation));
  }); return pdf.save();
}

