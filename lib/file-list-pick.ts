import {Zip, ZipPassThrough, strToU8} from 'fflate';

export const MAX_INDEX = 10000;
export const MAX_REQUESTS = 1000;
export const MAX_LIST_CHARS = 120000;
export const MAX_BUNDLE_BYTES = 64 * 1024 * 1024;
export type SourceEntry = {path:string; name:string; size:number};
export type LocalEntry = SourceEntry & {file:Blob};
export type MatchRow = {name:string; lines:number[]; candidates:string[]};
export type Choices = Record<string, string[] | undefined>;

export function matchList(entries:SourceEntry[], text:string):MatchRow[] {
  if (entries.length > MAX_INDEX) throw new Error('Choose a folder with at most 10,000 files.');
  if (text.length > MAX_LIST_CHARS) throw new Error('Use up to 120,000 characters in the list.');
  const lines = text.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/);
  const requests = new Map<string, number[]>();
  lines.forEach((name,i) => { if (name === '') return; const group=requests.get(name); if(group)group.push(i+1); else requests.set(name,[i+1]); });
  if (lines.filter(n=>n!=='').length > MAX_REQUESTS) throw new Error('Use at most 1,000 nonempty lines.');
  const index = new Map<string,string[]>();
  for (const entry of entries) { const found=index.get(entry.name); if(found)found.push(entry.path);else index.set(entry.name,[entry.path]); }
  return [...requests].map(([name,positions])=>({name,lines:positions,candidates:[...(index.get(name)||[])].sort()}));
}

export function rowSelection(row:MatchRow, choices:Choices):string[] {
  const explicit = Object.prototype.hasOwnProperty.call(choices,row.name) ? choices[row.name] : undefined;
  return explicit === undefined ? (row.candidates.length === 1 ? row.candidates : []) : explicit.filter(p=>row.candidates.includes(p));
}
export function unresolved(row:MatchRow, choices:Choices) { return row.candidates.length > 1 && !Object.prototype.hasOwnProperty.call(choices,row.name); }
export function selectedPaths(rows:MatchRow[], choices:Choices) { return [...new Set(rows.flatMap(r=>rowSelection(r,choices)))]; }

export function pathProblem(path:string):string {
  if(!path || path.length>220 || path.startsWith('/') || /[\\<>:"|?*]/.test(path) || /\p{Cc}/u.test(path)) return 'A selected path is too long or contains characters that cannot be safely extracted on Windows.';
  if(path.split('/').some(s=>!s||s==='.'||s==='..'||/[. ]$/.test(s)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(s))) return 'A selected path contains an unsafe or Windows-reserved folder or filename.';
  return '';
}

export function bundleProblem(entries:SourceEntry[], rows:MatchRow[], choices:Choices):string {
  if(rows.some(r=>unresolved(r,choices))) return 'Choose or skip each name with multiple matches before creating the ZIP.';
  const paths=selectedPaths(rows,choices); if(!paths.length) return 'Select at least one found file.';
  const byPath=new Map(entries.map(e=>[e.path,e])); const normalized=new Map<string,string>(); let bytes=0;
  if(byPath.size!==entries.length) return 'The chosen folder contains duplicate relative paths. Choose the folder again.';
  for(const path of paths) {
    const entry=byPath.get(path); if(!entry) return 'A selected file is no longer available. Choose the folder again.';
    const issue=pathProblem(path); if(issue)return `${issue} (${path})`;
    const key=path.normalize('NFC').toLowerCase();
    if(normalized.has(key)) return `These paths may overwrite each other when extracted: ${normalized.get(key)} / ${path}. Keep only one.`;
    normalized.set(key,path); bytes+=entry.size;
  }
  for(const [key,path] of normalized) { const segments=key.split('/'); segments.pop(); while(segments.length){ if(normalized.has(segments.join('/')))return `A file conflicts with a folder path: ${path}. Keep only one.`;segments.pop(); } }
  if(bytes>MAX_BUNDLE_BYTES)return 'The selected files exceed 64 MiB. Choose a smaller batch or use a desktop file tool.';
  return '';
}

export function makeReport(entries:SourceEntry[], rows:MatchRow[], choices:Choices, folder:string) {
  const selected=selectedPaths(rows,choices); const included=new Set(selected);
  return {tool:'HWANSEEK File List Pick',createdAt:new Date().toISOString(),folder,matching:'Exact full filename; case, spaces and Unicode spelling are preserved. Empty lines and one initial BOM are ignored.',
    indexedFiles:entries.length,requestedLines:rows.reduce((n,r)=>n+r.lines.length,0),uniqueNames:rows.length,
    selectedFiles:entries.filter(e=>included.has(e.path)).map(e=>({path:`files/${e.path}`,size:e.size})),
    requests:rows.map(r=>({name:r.name,lines:r.lines,status:unresolved(r,choices)?'needs-choice':!r.candidates.length?'missing':!rowSelection(r,choices).length?'skipped':'selected',candidates:r.candidates,selected:rowSelection(r,choices)})),
    scope:'Only files in the chosen folder were checked. Empty folders, permissions and filesystem metadata are not preserved. File bytes are copied without conversion.'};
}

export async function createBundle(entries:LocalEntry[], rows:MatchRow[], choices:Choices, folder:string, signal:AbortSignal, progress:(done:number,total:number)=>void):Promise<Blob> {
  const problem=bundleProblem(entries,rows,choices); if(problem)throw new Error(problem);
  const selected=new Set(selectedPaths(rows,choices)); const files=entries.filter(e=>selected.has(e.path));
  const parts:BlobPart[]=[];let zipError:Error|null=null;let finished=false;
  const archive=new Zip((error,chunk,final)=>{if(error)zipError=error;else parts.push(new Uint8Array(chunk));if(final)finished=true;});
  const check=()=>{signal.throwIfAborted();if(zipError)throw zipError;};
  let done=0;const total=files.reduce((n,e)=>n+e.size,0);
  try {
    for(const entry of files) {
      check();const item=new ZipPassThrough(`files/${entry.path}`);archive.add(item);
      const reader=entry.file.stream().getReader(); let count=0;
      const cancel=()=>{void reader.cancel().catch(()=>{});};signal.addEventListener('abort',cancel,{once:true});
      try { while(true){check();const next=await reader.read();check();if(next.done)break;count+=next.value.length;done+=next.value.length;if(count>entry.size)throw new Error('A file changed while being read. Choose the folder again.');item.push(next.value);progress(done,total);} }
      finally { signal.removeEventListener('abort',cancel);reader.releaseLock(); }
      if(count!==entry.size)throw new Error('A file could not be fully read. Choose the folder again.');
      item.push(new Uint8Array(),true);
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    check();const report=new ZipPassThrough('report.json');archive.add(report);report.push(strToU8(JSON.stringify(makeReport(entries,rows,choices,folder),null,2)),true);archive.end();check();
    if(!finished)throw new Error('The ZIP did not finish. Please try again.');
    return new Blob(parts,{type:'application/zip'});
  } catch(error) {archive.terminate();throw error;}
}
