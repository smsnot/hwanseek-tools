import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {unzipSync,strFromU8} from 'fflate';
import {matchList,selectedPaths,bundleProblem,createBundle,pathProblem,MAX_BUNDLE_BYTES,makeReport} from '../lib/file-list-pick.ts';

const base=new URL('../guides/file-list-pick/',import.meta.url);
const fixture=new URL('file-list-pick-practice/',base);
async function walk(root,prefix=''){const out=[];for(const item of await readdir(root,{withFileTypes:true})){const path=prefix+item.name;const url=new URL(encodeURIComponent(item.name)+(item.isDirectory()?'/':''),root);if(item.isDirectory())out.push(...await walk(url,path+'/'));else {const bytes=await readFile(url);out.push({path,name:item.name,size:bytes.length,file:new Blob([bytes])});}}return out;}
const entries=await walk(fixture),oracle=JSON.parse(await readFile(new URL('expected-results.json',base),'utf8')),text=await readFile(new URL('request-list.txt',base),'utf8');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

test('independent request oracle: nested names, case, missing, duplicates and ambiguity',()=>{
  const rows=matchList(entries,text);assert.equal(rows.length,oracle.counts.uniqueRequestedNames);
  assert.equal(rows.reduce((n,r)=>n+r.lines.length,0),oracle.counts.requestLines);
  for(const request of oracle.requests){const row=rows.find(r=>r.name===request.name);assert.deepEqual(row.candidates,request.candidates);assert.ok(row.lines.includes(request.line));}
  assert.match(bundleProblem(entries,rows,{}),/Choose or skip/);
  assert.equal(bundleProblem(entries,rows,oracle.explicitAmbiguityChoice),'');
  assert.equal(selectedPaths(rows,oracle.explicitAmbiguityChoice).length,10);
});
test('real ZIP output matches independent payload hashes, report and source bytes',async()=>{
  const rows=matchList(entries,text),choices=oracle.explicitAmbiguityChoice;
  const blob=await createBundle(entries,rows,choices,oracle.sourceFolder,new AbortController().signal,()=>{});
  const bytes=new Uint8Array(await blob.arrayBuffer()),out=unzipSync(bytes);
  assert.deepEqual(Object.keys(out).sort((a,b)=>a<b?-1:a>b?1:0),['report.json',...oracle.expectedSourcePayload.map(e=>'files/'+e.relativePath)].sort((a,b)=>a<b?-1:a>b?1:0));
  for(const item of oracle.expectedSourcePayload){assert.equal(out['files/'+item.relativePath].length,item.bytes);assert.equal(hash(out['files/'+item.relativePath]),item.sha256);}
  const report=JSON.parse(strFromU8(out['report.json']));assert.equal(report.requests.filter(r=>r.status==='missing').length,3);assert.equal(report.selectedFiles.length,10);assert.equal(report.requestedLines,14);assert.equal(report.requests.find(r=>r.name==='Project brief.pdf').lines.length,2);
  for(const e of await walk(fixture)){const initial=entries.find(x=>x.path===e.path);assert.equal(hash(await e.file.bytes()),hash(await initial.file.bytes()));}
});
test('exact Unicode, whitespace, punctuation, quotes and wildcard handling',async()=>{
  const edges=JSON.parse(await readFile(new URL('expected-edge-cases.json',base),'utf8'));const rows=matchList(entries,edges.requests.map(r=>r.name).join('\n'));
  for(const e of edges.requests)assert.deepEqual(rows.find(r=>r.name===e.name).candidates,e.exactCandidates);
  assert.equal(matchList(entries,'\uFEFFREADME.TXT\r\n\r\nREADME.TXT')[0].lines.join(','),'1,3');
});
test('output rejects traversal, Windows hazards and case/Unicode/path collisions',()=>{
  for(const p of ['../a','a/../b','/abs','a\\b','CON.txt','dir./b','dir/a ','a:b','a//b','a/'+('x'.repeat(220))])assert.ok(pathProblem(p),p);
  assert.equal(pathProblem('Notes/ leading-space.txt'),'');
  for(const paths of [['A.txt','a.txt'],['한글.txt','한글.txt'.normalize('NFD')],['a','A/file.txt']]){
    const e=paths.map(path=>({path,name:path.split('/').at(-1),size:1}));assert.match(bundleProblem(e,matchList(e,e.map(x=>x.name).join('\n')),{}),/overwrite|conflicts/);
  }
});
test('limits, skipped ambiguity and report namespace cannot silently drop selected data',async()=>{
  assert.throws(()=>matchList(Array(10001).fill({name:'a',path:'a',size:1}),'a'));
  assert.throws(()=>matchList(entries,Array(1001).fill('a').join('\n')));
  const big=[{name:'large',path:'large',size:MAX_BUNDLE_BYTES+1}];assert.match(bundleProblem(big,matchList(big,'large'),{}),/64 MiB/);
  const rows=matchList(entries,text);assert.equal(makeReport(entries,rows,{'IMG_0101.JPG':[]},'test').requests[0].status,'skipped');
  const e=[{name:'report.json',path:'report.json',size:4,file:new Blob(['mine'])},{name:'__proto__',path:'__proto__',size:2,file:new Blob(['ok'])}];
  const out=unzipSync(new Uint8Array(await (await createBundle(e,matchList(e,'report.json\n__proto__'),{},'test',new AbortController().signal,()=>{})).arrayBuffer()));
  assert.equal(strFromU8(out['files/report.json']),'mine');assert.equal(strFromU8(out['files/__proto__']),'ok');assert.ok(JSON.parse(strFromU8(out['report.json'])));
});
test('cancelled or unreadable sources never return a partial ZIP',async()=>{
  const controller=new AbortController();controller.abort();await assert.rejects(createBundle(entries,matchList(entries,'README.TXT'),{},'test',controller.signal,()=>{}));
  const e=[{name:'bad',path:'bad',size:2,file:new Blob(['x'])}];await assert.rejects(createBundle(e,matchList(e,'bad'),{},'test',new AbortController().signal,()=>{}),/fully read/);
  const mid=new AbortController();await assert.rejects(createBundle(entries,matchList(entries,'README.TXT'),{},'test',mid.signal,()=>mid.abort()));
});
