'use client';
import {useEffect,useRef,useState} from 'react';
import {ToolFrame} from '@/components/tool-frame';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Checkbox} from '@/components/ui/checkbox';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {PhotoPicker,PhotoPrivacy,usePhotos} from '@/components/photo-workbench';
import {fitPhoto,fitZip,download} from '@/lib/image-browser';
import {checkDimensions,outputNames} from '@/lib/image-core';
type Result={blob:Blob;url:string;width:number;height:number};
export default function Review(){
  const [width,setWidth]=useState('1920'),[height,setHeight]=useState('1080'),[background,setBackground]=useState('white'),[upscale,setUpscale]=useState(false),[results,setResults]=useState<Result[]>([]);
  const urls=useRef<string[]>([]);function invalidate(){p.setMessage('Settings changed. Create a new preview before saving.');p.setError('');urls.current.forEach(URL.revokeObjectURL);urls.current=[];setResults([]);}
  useEffect(()=>()=>urls.current.forEach(URL.revokeObjectURL),[]);
  const p=usePhotos(30,invalidate);const names=outputNames(p.photos.map(p=>p.name),'png');
  async function generate(){if(p.busy)return;invalidate();p.setBusy(true);p.setError('');let next:Result[]=[];
    try{const w=Number(width),h=Number(height);checkDimensions(w,h);if(w>4096||h>4096)throw new Error('Use a canvas up to 4,096 pixels per side.');let size=0;
      for(let i=0;i<p.photos.length;i++){p.setMessage(`Fitting image ${i+1} of ${p.photos.length}…`);const {blob,rect}=await fitPhoto(p.photos[i],w,h,background==='white',upscale);size+=blob.size;if(size>100_000_000)throw new Error('The output exceeds 100 MB. Choose a smaller canvas or fewer photos.');next.push({blob,url:URL.createObjectURL(blob),width:rect.width,height:rect.height});}
      if(!p.alive.current){next.forEach(r=>URL.revokeObjectURL(r.url));return;}urls.current=next.map(r=>r.url);setResults(next);p.setMessage(`Ready: ${next.length} PNG copies, each ${w} × ${h} pixels. Review the previews before saving.`);
    }catch(e){next.forEach(r=>URL.revokeObjectURL(r.url));p.setError((e as Error).message);p.setMessage('');}finally{if(p.alive.current)p.setBusy(false);}
  }
  async function save(){p.setBusy(true);try{download(await fitZip(p.photos,results.map(r=>r.blob)),'hwanseek-fitted-images.zip');p.setMessage('ZIP created. Your source files are unchanged.');}catch(e){p.setError((e as Error).message);}finally{p.setBusy(false);}}
  return <ToolFrame current="/image-fit-review" number="006 / IMAGES" title="Image fit review" intro="One canvas size. The whole photo, with room around it.">
    <PhotoPicker busy={p.busy} limit={30} onChoose={p.choose} onClear={p.clear} count={p.photos.length}/>
    <section className="review"><div className="control-body"><div className="number-row"><label>Canvas width (px)<Input type="number" min={1} max={4096} value={width} disabled={p.busy} onChange={e=>{setWidth(e.target.value);invalidate();}}/></label><label>Canvas height (px)<Input type="number" min={1} max={4096} value={height} disabled={p.busy} onChange={e=>{setHeight(e.target.value);invalidate();}}/></label><label>Background<NativeSelect value={background} disabled={p.busy} onChange={e=>{setBackground(e.target.value);invalidate();}}><NativeSelectOption value="white">White</NativeSelectOption><NativeSelectOption value="transparent">Transparent</NativeSelectOption></NativeSelect></label></div><label className="scope-confirm"><Checkbox checked={upscale} disabled={p.busy} onCheckedChange={v=>{setUpscale(v===true);invalidate();}}/>Allow smaller photos to enlarge</label><p className="small-note">Always fits the entire image. Output is PNG. Different aspect ratios create padding. Enlargement can soften detail.</p><div className="review-actions"><Button disabled={p.busy||!p.photos.length} onClick={generate}>Create previews</Button><Button variant="outline" disabled={p.busy||!results.length} onClick={save}>Download PNG ZIP</Button></div></div></section>
    <p className="status" role="status">{p.message||'Choose photos and a canvas size to begin.'}</p>{p.error&&<p role="alert" className="error">{p.error}</p>}
    <div className="photo-grid">{p.photos.map((photo,i)=><article className="photo-card" key={photo.id}><div className="photo-pair"><div><span>Original</span><img src={photo.thumb} alt={`Original ${photo.name}`}/></div>{results[i]&&<div><span>PNG result</span><img src={results[i].url} alt={`Fitted ${photo.name}`}/></div>}</div><strong>{photo.name}</strong><p>{photo.width} × {photo.height} source pixels{results[i]&&<> · photo occupies {results[i].width} × {results[i].height} pixels</>}</p>{results[i]&&<p>Saved as {names[i]} · {(results[i].blob.size/1000).toFixed(1)} KB</p>}</article>)}</div>
    <div className="notes-grid"><section><p className="eyebrow">HOW TO USE</p><h2>Choose. Fit. Review.</h2><ol><li>Select up to 30 still images.</li><li>Set the canvas dimensions and background.</li><li>Create previews, review all images, and save the ZIP.</li></ol></section><section><p className="eyebrow">WHERE IT STOPS</p><h2>Padding is part of the result.</h2><p>This does not remove backgrounds, extend scenes, or equalize the size of objects inside photos. Existing whitespace stays. Metadata and color profiles are not preserved; compare color-sensitive images separately. Duplicate or unsafe filenames are adjusted to prevent collisions.</p></section></div><PhotoPrivacy/>
  </ToolFrame>;
}
