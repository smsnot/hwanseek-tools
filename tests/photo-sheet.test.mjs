import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {makePhotoSheet} from '../lib/photo-sheet.ts';
import {PDFDocument} from 'pdf-lib';
import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs';
const readFont=async()=>new Uint8Array(await fs.readFile(new URL('../public/fonts/HwanseekFilename-Regular.ttf',import.meta.url)));
const jpeg=async()=>new Uint8Array(await fs.readFile(new URL('./fixtures/image-tools/orientation-2.jpg',import.meta.url)));
test('PDF keeps Unicode filenames as extractable text across wrapped lines and pages',async()=>{
 const bytes=await jpeg(),name='photo_서울_漢字_かな_カナ_é.jpg',names=[name,'long_'+ 'abcdef_'.repeat(25)+'.jpg',...Array.from({length:19},(_,i)=>`photo-${i}.jpg`)];
 const out=await makePhotoSheet(names.map(name=>({name,bytes,width:900,height:600})),'A4',3,readFont);
 assert.ok(out.pages>1);const loading=getDocument({data:new Uint8Array(out.bytes),useSystemFonts:true}),pdf=await loading.promise;let all='';
 for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i),text=await page.getTextContent({disableNormalization:true});all+=text.items.map(x=>x.str||'').join('');}
 for(const name of names)assert.ok(all.includes(name),name);await loading.destroy();
 const doc=await PDFDocument.load(out.bytes);assert.equal(doc.getPageCount(),out.pages);assert.equal(Math.round(doc.getPage(0).getWidth()),595);
});
test('unsupported filename glyphs fail explicitly instead of becoming question marks',async()=>{
 await assert.rejects(makePhotoSheet([{name:'photo_🦄.jpg',bytes:await jpeg(),width:900,height:600}],'Letter',2,readFont),/Unsupported character/);
});
