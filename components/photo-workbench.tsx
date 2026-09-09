'use client';
import {useEffect,useRef,useState} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {loadPhotos,freePhotos,type Photo} from '@/lib/image-browser';
export function usePhotos(limit:number,onChange:()=>void){
  const [photos,setPhotos]=useState<Photo[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  const current=useRef<Photo[]>([]),alive=useRef(true),lock=useRef(false);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;freePhotos(current.current);};},[]);
  function replace(next:Photo[]){current.current=next;setPhotos(next);}
  async function choose(files:File[]){
    if(lock.current)return;lock.current=true;setBusy(true);setError('');setMessage('Reading images…');onChange();
    try{const next=await loadPhotos(files,limit);if(!alive.current){freePhotos(next);return;}freePhotos(current.current);replace(next);setMessage(`${next.length} image${next.length===1?'':'s'} ready. Originals are unchanged.`);}
    catch(e){if(alive.current){setError((e as Error).message);setMessage('');}}
    finally{lock.current=false;if(alive.current)setBusy(false);}
  }
  function clear(){onChange();freePhotos(current.current);replace([]);setError('');setMessage('Files cleared.');}
  return {photos,replace,busy,setBusy,message,setMessage,error,setError,choose,clear,alive};
}
export function PhotoPicker({busy,limit,onChoose,onClear,count}:{busy:boolean;limit:number;onChoose:(files:File[])=>void;onClear:()=>void;count:number}){
  return <section className="file-pick"><label htmlFor="photo-files">Choose {limit===1?'an image':'images'}<Input id="photo-files" type="file" accept="image/jpeg,image/png,image/webp" multiple={limit>1} disabled={busy} onChange={e=>{if(e.target.files?.length)onChoose(Array.from(e.target.files));e.target.value='';}} /></label><p>JPG, PNG, still WebP · up to {limit} {limit===1?'image':'images'} · 20 MB per file · 12 million pixels per image · 100 MB total.</p>{count>0&&<Button variant="ghost" disabled={busy} onClick={onClear}>Clear files</Button>}</section>;
}
export function PhotoPrivacy(){return <details className="privacy"><summary>What happens to my photos?</summary><p>Selected images are processed in this browser tab. This tool does not send their contents to a server or an AI service, or save them in browser storage. Downloads are new copies. Reloading clears the session. The hosting provider handles ordinary page and font requests; external links have their own policies.</p></details>;}
