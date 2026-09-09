import test from 'node:test';
import assert from 'node:assert/strict';
import { cutPlan, imageSizeError } from '../lib/screenshot-cuts.ts';
import { candidateVideos, episodeKey, subtitleTags, proposedName, filenameError, collisionNames } from '../lib/subtitle-pairs.ts';
import { indexUnits, occurrences, normalizeQuote, rangeBoxes, quoteInBoxes, quadBoxes, writeHighlights, padBoxes } from '../lib/pdf-highlights.ts';
import { PDFDocument, PDFName, PDFArray, PDFDict } from 'pdf-lib';
import { zipSync, unzipSync } from 'fflate';

test('two original-coordinate cuts keep all three wanted bands and two markers', () => {
  const p = cutPlan(1000, [{ start: 200, end: 400 }, { start: 600, end: 800 }]);
  assert.equal(p.height, 656); assert.equal(p.removed, 400);
  assert.deepEqual(p.parts.filter(p => p.kind === 'keep').map(p => [p.start, p.end, p.outputY]), [[0, 200, 0], [400, 600, 228], [800, 1000, 456]]);
});
test('overlap and touching cuts merge without mutating input or deleting twice', () => {
  const cuts = [{ start: 400, end: 600 }, { start: 200, end: 450 }, { start: 600, end: 700 }]; const before = JSON.stringify(cuts);
  const p = cutPlan(1000, cuts); assert.equal(p.removed, 500); assert.deepEqual(p.merged, [{ start: 200, end: 700 }]); assert.equal(p.height, 528); assert.equal(JSON.stringify(cuts), before);
});
test('editing and undo derive from original, and edge cuts retain a marker', () => {
  assert.equal(cutPlan(1000, [{ start: 600, end: 800 }]).height, 828); assert.equal(cutPlan(1000, []).height, 1000);
  assert.equal(cutPlan(100, [{ start: 0, end: 20 }, { start: 80, end: 100 }]).height, 116);
});
test('invalid cuts and image dimensions fail before output', () => {
  for (const cuts of [[{start:0,end:100}], [{start:-1,end:20}], [{start:40,end:20}], [{start:0.5,end:3}], [{start:20,end:101}]]) assert.throws(() => cutPlan(100,cuts));
  assert.equal(imageSizeError(600, 1000), ''); assert.ok(imageSizeError(8000, 20000)); assert.ok(imageSizeError(1, 20001));
});
test('episode matching ignores sort order and refuses missing or multi-episode guesses', () => {
  const videos = ['Show.S01E02.mkv', 'Show.S01E01.mkv']; assert.deepEqual(candidateVideos('sub.1x01.en.srt', videos), [1]);
  assert.deepEqual(candidateVideos('sub.S01E03.en.srt', videos), []); assert.equal(episodeKey('English.srt'), null);
  for (const n of ['Show.S01E01E02.srt', 'Show.S01E01-E02.srt', 'Show.S01E01-02.srt', 'Show.S01E01.S01E02.srt']) assert.equal(episodeKey(n), null, n);
});
test('ambiguous videos remain multiple candidates while language and accessibility tags survive', () => {
  assert.deepEqual(candidateVideos('sub.S01E04.en.srt', ['Show.S01E04.1080p.mkv', 'Show.S01E04.2160p.mkv']), [0,1]);
  assert.equal(subtitleTags('sub.S01E01.English.forced.SDH.srt'), 'en.forced.sdh'); assert.equal(proposedName('C:\\vid\\Show.S01E01.mkv','sub.fr.forced.srt','fr.forced'),'Show.S01E01.fr.forced.srt');
});
test('ZIP names reject unsafe paths, reserved names, extension changes, and collisions', () => {
  for (const n of ['../a.srt','CON.srt','x:y.srt',' x.srt','x.vtt']) assert.ok(filenameError(n,'srt'), n);
  assert.equal(filenameError('Show.S01E01.en.srt','srt'),''); assert.ok(collisionNames(['Show.EN.srt','show.en.srt']).has('show.en.srt'));
});
test('ZIP copies preserve exact bytes including BOM, CRLF, and non-UTF8 data', () => {
  const files = { 'Show.S01E01.en.srt': new Uint8Array([239,187,191,49,13,10,255,0,10]), 'Show.S01E01.fr.forced.srt': new Uint8Array([233,10,13,10]) };
  const copy = unzipSync(zipSync(files,{level:0})); assert.deepEqual(Object.keys(copy),Object.keys(files)); for (const n of Object.keys(files)) assert.deepEqual(copy[n],files[n]);
});
test('PDF exact-text indexing preserves case, hyphens, item splits and Unicode offsets', () => {
  const index = indexUnits([{text:'  Re',box:null},{text:'view\n\t',box:null},{text:'A-10 😀',box:null}]); assert.equal(index.text, 'Review A-10 😀'); assert.equal(index.text.length, index.map.length);
  assert.deepEqual(occurrences(index.text,'review A-10'),[]); assert.equal(normalizeQuote('Review\n A-10'), 'Review A-10');
});
test('repeated PDF passages remain multiple candidates and changed wording is not guessed', () => {
  assert.deepEqual(occurrences('Read this. Read this. Read that.','Read this.'),[0,11]); assert.deepEqual(occurrences('Read that.','Read this.'),[]);
});
test('PDF source extraction selects partial text by geometry rather than annotation comments', () => {
  const units = [...'XABCY'].map((text,i)=>({text,box:{x1:i*10,y1:0,x2:i*10+10,y2:10}})); const q = [{x1:10,y1:0,x2:40,y2:10}];
  assert.equal(quoteInBoxes(units,q).quote,'ABC'); assert.deepEqual(rangeBoxes(indexUnits(units),1,3),q); assert.deepEqual(quadBoxes(new Float32Array([10,10,40,10,10,0,40,0])),q);
});
test('left and right PDF edge adjustments are independent and bounded', () => {
  const boxes = [{x1:100,y1:200,x2:300,y2:215}];
  assert.deepEqual(padBoxes(boxes,4,0),[{x1:96,y1:200,x2:300,y2:215}]); assert.deepEqual(boxes,[{x1:100,y1:200,x2:300,y2:215}]);
  assert.deepEqual(padBoxes(boxes,0,2),[{x1:100,y1:200,x2:302,y2:215}]); assert.throws(()=>padBoxes(boxes,7,0));
});
test('PDF export adds real multiline Highlight and keeps the target existing annotation', async () => {
  const pdf = await PDFDocument.create(); const page = pdf.addPage([612,792]); const existing = pdf.context.obj({ Type:'Annot',Subtype:'Text',Rect:[20,20,30,30],Contents:'Existing' }); page.node.addAnnot(pdf.context.register(existing));
  const before = await pdf.save(); const transfer = { page:1, quote:'A passage on two lines', boxes:[{x1:72,y1:600,x2:200,y2:614},{x1:72,y1:582,x2:180,y2:596}] };
  const output = await writeHighlights(before,[transfer]); const check = await PDFDocument.load(output); const arr = check.getPage(0).node.lookup(PDFName.of('Annots'),PDFArray); assert.equal(arr.size(),2);
  const ann = arr.lookup(1,PDFDict); assert.equal(ann.lookup(PDFName.of('Subtype'),PDFName).asString(),'/Highlight'); assert.equal(ann.lookup(PDFName.of('QuadPoints'),PDFArray).size(),16); assert.ok(ann.has(PDFName.of('AP')));
  const original = await PDFDocument.load(before); assert.equal(original.getPage(0).node.lookup(PDFName.of('Annots'),PDFArray).size(),1);
});
