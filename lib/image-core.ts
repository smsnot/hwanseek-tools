export const MAX_PIXELS = 12_000_000;
export function checkDimensions(w:number,h:number) {
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>12000||h>12000||w*h>MAX_PIXELS) throw new Error('Use images up to 12 million pixels and 12,000 pixels on either side.');
}
export function contain(sw:number,sh:number,w:number,h:number,upscale=false) {
  checkDimensions(sw,sh); checkDimensions(w,h);
  const scale=Math.min(w/sw,h/sh,upscale?Infinity:1);
  const width=Math.max(1,Math.min(w,Math.round(sw*scale))),height=Math.max(1,Math.min(h,Math.round(sh*scale)));
  return {x:Math.floor((w-width)/2),y:Math.floor((h-height)/2),width,height,scale};
}
export function inspectImage(a:Uint8Array) {
  const d=new DataView(a.buffer,a.byteOffset,a.byteLength);
  const text=(at:number,n:number)=>String.fromCharCode(...a.subarray(at,at+n));
  let width=0,height=0,format='';
  if(a.length>=24&&text(1,3)==='PNG'&&a[0]===137&&text(12,4)==='IHDR') {
    format='PNG';width=d.getUint32(16);height=d.getUint32(20);
    let end=false;
    for(let p=8;p+12<=a.length;) {
      const n=d.getUint32(p),kind=text(p+4,4);
      if(n>a.length-p-12) throw new Error('This PNG is incomplete.');
      if(kind==='acTL') throw new Error('Animated PNG is not supported. Choose a still image.');
      p+=n+12;if(kind==='IEND'){end=true;break;}
    }
    if(!end)throw new Error('This PNG is incomplete.');
  } else if(a.length>=12&&text(0,4)==='RIFF'&&text(8,4)==='WEBP') {
    format='WebP';const end=d.getUint32(4,true)+8;
    if(end!==a.length)throw new Error('This WebP is incomplete or malformed.');
    let p=12;
    while(p+8<=end){
      const kind=text(p,4),n=d.getUint32(p+4,true),v=p+8;
      if(n>end-v)throw new Error('This WebP is incomplete.');
      if(kind==='ANIM'||kind==='ANMF'||(kind==='VP8X'&&n>=10&&(a[v]&2)))throw new Error('Animated WebP is not supported. Choose a still image.');
      if(kind==='VP8X'&&n>=10){width=1+a[v+4]+(a[v+5]<<8)+(a[v+6]<<16);height=1+a[v+7]+(a[v+8]<<8)+(a[v+9]<<16);}
      if(kind==='VP8 '&&n>=10&&!width&&a[v+3]===157&&a[v+4]===1&&a[v+5]===42){width=d.getUint16(v+6,true)&16383;height=d.getUint16(v+8,true)&16383;}
      if(kind==='VP8L'&&n>=5&&!width&&a[v]===47){const bits=d.getUint32(v+1,true);width=(bits&16383)+1;height=((bits>>>14)&16383)+1;}
      p=v+n+(n%2);
    }
    if(p!==end)throw new Error('This WebP has invalid chunk lengths.');
  } else if(a.length>=4&&a[0]===255&&a[1]===216){
    format='JPG';let p=2;
    while(p+3<a.length){
      if(a[p]!==255)break;while(a[p]===255)p++;
      const marker=a[p++];if(marker===218||marker===217)break;
      if(marker===1||(marker>=208&&marker<=215))continue;
      if(p+2>a.length)break;const n=d.getUint16(p);
      if(n<2||p+n>a.length)throw new Error('This JPG is incomplete.');
      if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)&&n>=8){height=d.getUint16(p+3);width=d.getUint16(p+5);break;}
      p+=n;
    }
  } else throw new Error('Choose a JPG, PNG, or still WebP file. Renaming an extension does not convert an image.');
  checkDimensions(width,height);return {width,height,format};
}
export function outputNames(names:string[],ext:string) {
  const used=new Set<string>();
  return names.map(name=>{
    let stem=name.split(/[\\/]/).at(-1)!.replace(/\.[^.]*$/,'').normalize('NFC').replace(/[<>:"|?*\u0000-\u001f\u007f]/g,'_').replace(/[ .]+$/,'');
    stem=Array.from(stem||'image').slice(0,100).join('');
    if(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(stem))stem='_'+stem;
    let result=stem+'.'+ext,i=2;
    while(used.has(result.toLowerCase()))result=stem+' ('+(i++)+').'+ext;
    used.add(result.toLowerCase());return result;
  });
}
export const PAPER={A4:[595.28,841.89],Letter:[612,792]} as const;
export function wrapText(text:string,maxWidth:number,measure:(s:string)=>number) {
  const lines:string[]=[];let line='';
  for(const character of Array.from(text)) {
    if(measure(character)>maxWidth)throw new Error('A filename character is too wide for this layout.');
    if(line&&measure(line+character)>maxWidth){lines.push(line);line=character;}else line+=character;
  }
  if(line)lines.push(line);return lines.length?lines:[''];
}
export function sheetPlan(names:string[],paper:keyof typeof PAPER,columns:number,measure:(s:string)=>number) {
  if(!PAPER[paper]||!Number.isInteger(columns)||columns<2||columns>4||!names.length||names.length>60)throw new Error('Choose 1–60 photos and 2–4 columns.');
  const [width,height]=PAPER[paper],margin=32,gap=14,cell=(width-margin*2-gap*(columns-1))/columns,imageHeight=cell*.78;
  const pages:{index:number;x:number;y:number;width:number;imageHeight:number;lines:string[]}[][]=[[]];let top=height-55;
  for(let i=0;i<names.length;i+=columns){
    const row=names.slice(i,i+columns).map((name,j)=>({index:i+j,lines:wrapText(`${i+j+1}. ${name}`,cell,measure)}));
    const rowHeight=imageHeight+12+Math.max(...row.map(x=>x.lines.length))*12+18;
    if(rowHeight>height-95)throw new Error('A filename is too long for the page. Shorten its display name.');
    if(top-rowHeight<32){pages.push([]);top=height-55;}
    row.forEach((r,j)=>pages.at(-1)!.push({...r,x:margin+j*(cell+gap),y:top,width:cell,imageHeight}));top-=rowHeight;
  }
  return {width,height,pages};
}
