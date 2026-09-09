import { indexUnits, quadBoxes, quoteInBoxes, type Box, type TextIndex, type TextUnit } from './pdf-highlights';
export type PDFPageData = { page: number; width: number; height: number; image: string; index: TextIndex; originalHighlights: number; toView: (x: number, y: number) => number[] };
export type SourceHighlight = { page: number; boxes: Box[]; quote: string; fragmented: boolean };
export type PDFData = { bytes: Uint8Array; name: string; pages: PDFPageData[]; highlights: SourceHighlight[]; skipped: number };
export function disposePDF(data: PDFData | null) { data?.pages.forEach(p => URL.revokeObjectURL(p.image)); }
export async function pdfjs() { const lib = await import('pdfjs-dist'); lib.GlobalWorkerOptions.workerSrc = '/pdf-assets/pdf.worker.min.mjs'; return lib; }
export async function readPDF(file: File, progress: (text: string) => void): Promise<PDFData> {
  if (!/\.pdf$/i.test(file.name) || file.size > 15 * 1024 * 1024) throw new Error('Choose a PDF up to 15 MB.');
  const bytes = new Uint8Array(await file.arrayBuffer()); const { PDFDocument } = await import('pdf-lib'); const check = await PDFDocument.load(bytes.slice());
  if (check.isEncrypted) throw new Error('Encrypted PDFs are not supported.');
  if (check.getForm().getFields().length) throw new Error('Use a PDF without forms or signature fields.');
  const lib = await pdfjs(); const loading = lib.getDocument({ data: bytes.slice(), cMapUrl: '/pdf-assets/cmaps/', cMapPacked: true, standardFontDataUrl: '/pdf-assets/standard_fonts/', wasmUrl: '/pdf-assets/wasm/' }); const doc = await loading.promise;
  const result: PDFData = { bytes, name: file.name, pages: [], highlights: [], skipped: 0 };
  try {
    if (doc.numPages > 20) throw new Error('Use a PDF with up to 20 pages.');
    for (let p = 1; p <= doc.numPages; p++) {
      progress(`Reading ${file.name} · page ${p} of ${doc.numPages}…`); const page = await doc.getPage(p); const viewport = page.getViewport({ scale: 1 });
      if (page.rotate !== 0 || page.userUnit !== 1 || viewport.width > 2000 || viewport.height > 3000) throw new Error(`Page ${p}: rotated or unusually sized pages are not supported.`);
      const content = await page.getTextContent(); const items = content.items.filter((x): x is import('pdfjs-dist/types/src/display/api').TextItem => 'str' in x);
      if (items.reduce((n, x) => n + x.str.length, 0) > 8000) throw new Error(`Page ${p} has too much text. Use a simpler document.`);
      if (items.some(x => x.dir === 'rtl' || Math.abs(x.transform[1]) > .01 || Math.abs(x.transform[2]) > .01 || content.styles[x.fontName]?.vertical)) throw new Error(`Page ${p}: only horizontal left-to-right text is supported.`);
      const canvas = document.createElement('canvas'); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
      await page.render({ canvas, viewport }).promise; await document.fonts.ready;
      const wrap = document.createElement('div'); wrap.style.cssText = `position:fixed;left:-10000px;top:0;width:${viewport.width}px;height:${viewport.height}px;padding:0;border:0;opacity:0;pointer-events:none;`; wrap.style.setProperty('--total-scale-factor', String(viewport.scale));
      const layerDiv = document.createElement('div'); layerDiv.className = 'textLayer'; wrap.appendChild(layerDiv); document.body.appendChild(wrap);
      const layer = new lib.TextLayer({ textContentSource: content, container: layerDiv, viewport }); const units: TextUnit[] = [];
      try {
        await layer.render(); await document.fonts.ready; await new Promise<void>(r => requestAnimationFrame(() => r())); const origin = wrap.getBoundingClientRect();
        const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
        layer.textDivs.forEach((span, i) => {
          const str = layer.textContentItemsStr[i]; const node = span.firstChild;
          if (node?.nodeType === Node.TEXT_NODE) for (const seg of segmenter.segment(str)) { const range = document.createRange(); range.setStart(node, seg.index); range.setEnd(node, seg.index + seg.segment.length); const r = range.getBoundingClientRect(); const a = viewport.convertToPdfPoint(r.left - origin.left, r.top - origin.top), b = viewport.convertToPdfPoint(r.right - origin.left, r.bottom - origin.top); units.push({ text: seg.segment, box: r.width > 0 && r.height > 0 ? { x1: Math.min(a[0], b[0]), y1: Math.min(a[1], b[1]), x2: Math.max(a[0], b[0]), y2: Math.max(a[1], b[1]) } : null }); }
          if (items[i]?.hasEOL) units.push({ text: '\n', box: null });
        });
      } finally { layer.cancel(); wrap.remove(); }
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Page preview could not be created.')), 'image/png')); canvas.width = canvas.height = 0;
      const annotations = await page.getAnnotations({ intent: 'any' }); const highlighted = annotations.filter(a => a.subtype === 'Highlight');
      for (const a of highlighted) { const boxes = quadBoxes(a.quadPoints); if (!boxes.length) { result.skipped++; continue; } const quote = quoteInBoxes(units, boxes); result.highlights.push({ page: p, boxes, ...quote }); }
      if (result.highlights.length + result.skipped > 100) throw new Error('Use a PDF with up to 100 embedded highlights.');
      result.pages.push({ page: p, width: viewport.width, height: viewport.height, image: URL.createObjectURL(blob), index: indexUnits(units), originalHighlights: highlighted.length, toView: (x, y) => viewport.convertToViewportPoint(x, y) }); page.cleanup();
    }
    if (!result.pages.some(p => p.index.text)) throw new Error('No selectable text was found. Scanned PDFs need OCR in another tool first.');
    return result;
  } catch (e) { disposePDF(result); throw e; } finally { await loading.destroy(); }
}

