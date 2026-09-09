import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {contain,inspectImage,outputNames,sheetPlan,wrapText} from '../lib/image-core.ts';
const fixtures=new URL('./fixtures/image-tools/',import.meta.url);
test('contain uses exact bounds, no enlargement and centers portrait/landscape',()=>{
 assert.deepEqual(contain(900,600,1920,1080),{x:510,y:240,width:900,height:600,scale:1});
 const r=contain(600,900,1920,1080,true);assert.equal(r.width,720);assert.equal(r.height,1080);assert.equal(r.x,600);
 assert.equal(contain(1,12000,100,100).width,1);
 assert.throws(()=>contain(20000,20000,100,100));assert.throws(()=>contain(100,100,0,100));
});
test('image signature and chunk checks distinguish still images from animation',async()=>{
 for(const [file,format] of [['landscape.png','PNG'],['orientation-6.jpg','JPG'],['still.webp','WebP']])assert.equal(inspectImage(new Uint8Array(await fs.readFile(new URL(file,fixtures)))).format,format);
 for(const file of ['animated.png','animated.webp']){const bytes=new Uint8Array(await fs.readFile(new URL(file,fixtures)));assert.throws(()=>inspectImage(bytes),/Animated/);}
 const truncated=new Uint8Array(await fs.readFile(new URL('still.webp',fixtures))).slice(0,20);assert.throws(()=>inspectImage(truncated));
 assert.throws(()=>inspectImage(new TextEncoder().encode('<svg>fake.png</svg>')));
});
test('ZIP names stay distinct after case folding, sanitizing and extension changes',()=>{
 const n=outputNames(['photo.jpg','PHOTO.png','photo (2).jpg','../photo.jpg','CON.png','__proto__.png','서울.jpg','x:y.jpg','x?y.png'],'png');
 assert.equal(n.length,new Set(n.map(x=>x.toLowerCase())).size);assert.ok(n.every(x=>!/[\\/:]/.test(x)));assert.equal(n[4],'_CON.png');assert.equal(n[5],'__proto__.png');assert.equal(n[6],'서울.png');
});
test('caption wrapping preserves every character without spaces or truncation',()=>{
 const name='photo_서울_漢字_かな_カナ_é_'+ 'x'.repeat(180)+'.png';const lines=wrapText(name,90,s=>Array.from(s).length*5);assert.equal(lines.join(''),name);assert.ok(lines.every(s=>s.length<=18));
});
test('every contact-sheet layout paginates complete rows within page bounds',()=>{
 const names=Array.from({length:60},(_,i)=>`image-${i+1}-${'long'.repeat(i%5)}.png`);
 for(const paper of ['A4','Letter'])for(const columns of [2,3,4]){const p=sheetPlan(names,paper,columns,s=>s.length*4.5);assert.ok(p.pages.length>1);assert.deepEqual(p.pages.flat().map(x=>x.index),names.map((_,i)=>i));for(const c of p.pages.flat())assert.ok(c.y-c.imageHeight-16-(c.lines.length-1)*12>32);}
});
