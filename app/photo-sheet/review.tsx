'use client';
import {useEffect,useRef,useState} from 'react';
import {ToolFrame} from '@/components/tool-frame';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {PhotoPicker,PhotoPrivacy,usePhotos} from '@/components/photo-workbench';
import {canvasOf,canvasBlob,decode,download} from '@/lib/image-browser';
import {type PAPER} from '@/lib/image-core';
import {makePhotoSheet,type SheetPhoto} from '@/lib/photo-sheet';
export default function Review(){
  const [paper,setPaper]=useState<keyof typeof PAPER>('A4'),[columns,setColumns]=useState(3),[result,setResult]=useState<{blob:Blob;url:string;pages:number}|null>(null);const url=useRef('');
  function invalidate(){p.setMessage('Settings changed. Create a new preview before saving.');p.setError('');if(url.current)URL.revokeObjectURL(url.current);url.current='';setResult(null);}
  useEffect(()=>()=>{if(url.current)URL.revokeObjectURL(url.current);},[]);
  const p=usePhotos(60,invalidate);
  function move(i:number,dir:number){const next=[...p.photos];[next[i],next[i+dir]]=[next[i+dir],next[i]];p.replace(next);invalidate();}
  async function generate(){if(p.busy)return;invalidate();p.setBusy(true);p.setError('');
    try{const images:SheetPhoto[]=[];
      for(let i=0;i<p.photos.length;i++){p.setMessage(`Preparing photo ${i+1} of ${p.photos.length}…`);const photo=p.photos[i],b=await decode(photo.file);try{
        const s=Math.min(1,900/b.width,900/b.height),w=Math.max(1,Math.round(b.width*s)),h=Math.max(1,Math.round(b.height*s)),{canvas,ctx}=canvasOf(w,h,true);
        try{ctx.drawImage(b,0,0,w,h);const blob=await canvasBlob(canvas,'image/jpeg',.86);images.push({name:photo.name,bytes:new Uint8Array(await blob.arrayBuffer()),width:w,height:h});}finally{canvas.width=0;canvas.height=0;}
      }finally{b.close();}}
      p.setMessage('Laying out photos and filenames…');const out=await makePhotoSheet(images,paper,columns,async()=>{p.setMessage('Loading the filename font…');const r=await fetch('/fonts/HwanseekFilename-Regular.ttf');if(!r.ok)throw new Error('The filename font could not load. Please try again.');return new Uint8Array(await r.arrayBuffer());});
      if(!p.alive.current)return;const blob=new Blob([new Uint8Array(out.bytes)],{type:'application/pdf'});url.current=URL.createObjectURL(blob);setResult({blob,url:url.current,pages:out.pages});p.setMessage(`${out.pages}-page PDF ready. Check the preview and filenames before saving.`);
    }catch(e){p.setError((e as Error).message);p.setMessage('');}finally{if(p.alive.current)p.setBusy(false);}
  }
  return <ToolFrame current="/photo-sheet" number="008 / IMAGES" title="Photo sheet" intro="Photos and filenames together. A PDF you can review, print, or share.">
    <PhotoPicker busy={p.busy} limit={60} onChoose={p.choose} onClear={p.clear} count={p.photos.length}/>
    <section className="review"><div className="control-body"><div className="number-row"><label>Paper size<NativeSelect value={paper} disabled={p.busy} onChange={e=>{setPaper(e.target.value as keyof typeof PAPER);invalidate();}}><NativeSelectOption value="A4">A4</NativeSelectOption><NativeSelectOption value="Letter">US Letter</NativeSelectOption></NativeSelect></label><label>Columns<NativeSelect value={columns} disabled={p.busy} onChange={e=>{setColumns(Number(e.target.value));invalidate();}}>{[2,3,4].map(n=><NativeSelectOption key={n} value={n}>{n} columns</NativeSelectOption>)}</NativeSelect></label></div><p className="small-note">Use the arrows to arrange photos. Display names below are editable; source filenames stay unchanged. Long names wrap and remain selectable in the PDF.</p><div className="review-actions"><Button disabled={p.busy||!p.photos.length} onClick={generate}>Create PDF preview</Button><Button variant="outline" disabled={!result||p.busy} onClick={()=>result&&download(result.blob,'hwanseek-photo-sheet.pdf')}>Download PDF</Button></div></div></section>
    <p className="status" role="status">{p.message||'Choose photos to begin.'}</p>{p.error&&<p role="alert" className="error">{p.error}</p>}
    {result&&<section className="sheet-preview"><h2>PDF preview · {result.pages} {result.pages===1?'page':'pages'}</h2><p className="small-note">If your browser does not show PDFs here, download the file to review it.</p><iframe title="Photo sheet PDF preview" src={result.url}/></section>}
    <div className="photo-grid sheet-photo-grid">{p.photos.map((photo,i)=><article className="photo-card" key={photo.id}><img className="sheet-thumb" src={photo.thumb} alt={`Photo ${i+1}: ${photo.name}`}/><label htmlFor={'name-'+photo.id}>{i+1}. Display filename<Input id={'name-'+photo.id} value={photo.name} maxLength={240} disabled={p.busy} onChange={e=>{p.replace(p.photos.map((x,j)=>i===j?{...x,name:e.target.value}:x));invalidate();}}/></label><p>Source: {photo.file.name}</p><div className="review-actions"><Button variant="outline" aria-label={`Move photo ${i+1} earlier`} disabled={p.busy||i===0} onClick={()=>move(i,-1)}>← Earlier</Button><Button variant="outline" aria-label={`Move photo ${i+1} later`} disabled={p.busy||i===p.photos.length-1} onClick={()=>move(i,1)}>Later →</Button><Button variant="ghost" disabled={p.busy} onClick={()=>{URL.revokeObjectURL(photo.thumb);p.replace(p.photos.filter((_,j)=>i!==j));invalidate();}}>Remove</Button></div></article>)}</div>
    <div className="notes-grid"><section><p className="eyebrow">HOW TO USE</p><h2>Arrange. Preview. Download.</h2><ol><li>Select up to 60 still images.</li><li>Arrange the order and check display filenames.</li><li>Choose paper size and columns, create a preview, and save the PDF.</li></ol></section><section><p className="eyebrow">WHERE IT STOPS</p><h2>An overview, not a print proof.</h2><p>The PDF contains smaller JPG previews on white, not full-resolution originals. This is not a color-proofing or RAW workflow. Metadata is not preserved. Latin and many Korean, Chinese, and Japanese filename characters are supported; unsupported characters require editing the display name. More columns mean smaller pictures.</p></section></div><PhotoPrivacy/>
  </ToolFrame>;
}
