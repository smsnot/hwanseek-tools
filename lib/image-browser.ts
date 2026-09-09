import {checkDimensions,contain,inspectImage,outputNames} from './image-core';
export type Photo={id:string;file:File;name:string;width:number;height:number;thumb:string};
export function canvasBlob(canvas:HTMLCanvasElement,type='image/png',quality?:number):Promise<Blob>{return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob&&blob.type===type?resolve(blob):reject(new Error('This browser could not create the requested image format.')),type,quality));}
export function canvasOf(w:number,h:number,white=false){checkDimensions(w,h);const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');if(!ctx)throw new Error('Canvas is unavailable.');ctx.imageSmoothingQuality='high';if(white){ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);}return {canvas:c,ctx};}
export async function decode(file:File){const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});try{checkDimensions(bitmap.width,bitmap.height);return bitmap;}catch(e){bitmap.close();throw e;}}
export async function loadPhotos(files:File[],limit:number):Promise<Photo[]>{
  if(!files.length||files.length>limit)throw new Error(`Choose 1–${limit} images at a time.`);
  if(files.reduce((n,f)=>n+f.size,0)>100_000_000)throw new Error('Choose up to 100 MB of source files at a time.');
  const result:Photo[]=[];
  try{for(const file of files){
    if(file.size>20_000_000)throw new Error(`${file.name}: use a file under 20 MB.`);
    try{inspectImage(new Uint8Array(await file.arrayBuffer()));}catch(e){throw new Error(`${file.name}: ${(e as Error).message}`);}
    const b=await decode(file);try{
      const s=Math.min(1,480/b.width,480/b.height),{canvas,ctx}=canvasOf(Math.max(1,Math.round(b.width*s)),Math.max(1,Math.round(b.height*s)));
      ctx.drawImage(b,0,0,canvas.width,canvas.height);const blob=await canvasBlob(canvas);canvas.width=0;canvas.height=0;
      result.push({id:crypto.randomUUID(),file,name:file.name,width:b.width,height:b.height,thumb:URL.createObjectURL(blob)});
    }finally{b.close();}
  }return result;}catch(e){result.forEach(p=>URL.revokeObjectURL(p.thumb));throw e;}
}
export function freePhotos(photos:Photo[]){photos.forEach(p=>URL.revokeObjectURL(p.thumb));}
export function download(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
export async function fitPhoto(photo:Photo,width:number,height:number,white:boolean,upscale:boolean){
  if(width>4096||height>4096)throw new Error('Use a canvas up to 4,096 pixels per side.');
  const b=await decode(photo.file);const {canvas,ctx}=canvasOf(width,height,white);
  try{const rect=contain(b.width,b.height,width,height,upscale);ctx.drawImage(b,rect.x,rect.y,rect.width,rect.height);return {blob:await canvasBlob(canvas),rect};}finally{b.close();canvas.width=0;canvas.height=0;}
}
export type SizedImage={blob:Blob;width:number;height:number;quality:number;passes:boolean};
export async function sizedJpeg(photo:Photo,maxBytes:number,maxWidth:number,onStep:(label:string)=>void=()=>{}):Promise<SizedImage>{
  if(!Number.isInteger(maxBytes)||maxBytes<1000||maxBytes>20_000_000||!Number.isInteger(maxWidth)||maxWidth<16||maxWidth>4096)throw new Error('Use 1–20,000 KB and a maximum width of 16–4,096 pixels.');
  const b=await decode(photo.file);let smallest:SizedImage|undefined;
  try{let width=Math.min(b.width,maxWidth),height=Math.max(1,Math.round(b.height*width/b.width));
    for(let level=0;level<10;level++){
      onStep(`Checking ${width} × ${height} pixels…`);
      const {canvas,ctx}=canvasOf(width,height,true);ctx.drawImage(b,0,0,width,height);
      try{for(const quality of [.92,.82,.72,.62,.52,.42]){
        const blob=await canvasBlob(canvas,'image/jpeg',quality),candidate={blob,width,height,quality,passes:blob.size<=maxBytes};
        if(!smallest||blob.size<smallest.blob.size)smallest=candidate;
        if(candidate.passes)return candidate;
      }}finally{canvas.width=0;canvas.height=0;}
      const nextWidth=Math.max(Math.min(16,b.width),Math.floor(width*.78));if(nextWidth===width)break;
      width=nextWidth;height=Math.max(1,Math.round(b.height*width/b.width));
    }
    if(!smallest)throw new Error('No result could be created.');return smallest;
  }finally{b.close();}
}
export async function fitZip(photos:Photo[],blobs:Blob[]){
  const {zipSync}=await import('fflate'),names=outputNames(photos.map(p=>p.name),'png'),entries:Record<string,Uint8Array>=Object.create(null);
  for(let i=0;i<blobs.length;i++)entries[names[i]]=new Uint8Array(await blobs[i].arrayBuffer());
  return new Blob([new Uint8Array(zipSync(entries,{level:0}))],{type:'application/zip'});
}
