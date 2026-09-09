import { PDFDocument,StandardFonts,rgb } from 'pdf-lib';
import {sheetPlan,contain,type PAPER} from './image-core.ts';
export type SheetPhoto={name:string;bytes:Uint8Array;width:number;height:number};
export async function makePhotoSheet(photos:SheetPhoto[],paper:keyof typeof PAPER,columns:number,loadFont:()=>Promise<Uint8Array>){
  const doc=await PDFDocument.create(),latin=await doc.embedFont(StandardFonts.Helvetica);let font=latin;
  const characters=new Set(photos.flatMap(p=>Array.from(p.name)).map(c=>c.codePointAt(0)!));
  const latinSet=new Set(latin.getCharacterSet());
  if([...characters].some(c=>!latinSet.has(c))){
    const fontkit=(await import('@pdf-lib/fontkit')).default;doc.registerFontkit(fontkit);
    // Keep the full font: fontkit subsetting can drop glyph outlines in Chromium PDF viewers.
    font=await doc.embedFont(await loadFont(),{subset:false,features:{liga:false,clig:false,locl:false}});
  }
  const supported=new Set(font.getCharacterSet());
  for(const p of photos){
    if(!p.name.trim()||p.name.length>240||/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/u.test(p.name))throw new Error('Use display names of 1–240 characters without control or direction-changing characters.');
    const missing=Array.from(p.name).filter(c=>!supported.has(c.codePointAt(0)!));
    if(missing.length)throw new Error(`Unsupported character ${[...new Set(missing)].join(' ')} in “${p.name}”. Edit its display name before making the PDF.`);
  }
  const plan=sheetPlan(photos.map(p=>p.name),paper,columns,s=>font.widthOfTextAtSize(s,9));
  doc.setTitle('Photo sheet');doc.setCreator('HWANSEEK Photo Sheet');
  for(let pi=0;pi<plan.pages.length;pi++){
    const page=doc.addPage([plan.width,plan.height]);page.drawText('HWANSEEK / PHOTO SHEET',{x:32,y:plan.height-28,size:10,font:latin,color:rgb(.09,.2,.35)});
    page.drawText(`Page ${pi+1} / ${plan.pages.length}`,{x:plan.width-100,y:20,size:9,font:latin});
    for(const cell of plan.pages[pi]){
      const p=photos[cell.index],img=await doc.embedJpg(p.bytes),r=contain(p.width,p.height,Math.floor(cell.width),Math.floor(cell.imageHeight),true);
      page.drawRectangle({x:cell.x,y:cell.y-cell.imageHeight,width:cell.width,height:cell.imageHeight,color:rgb(.96,.97,.98)});
      page.drawImage(img,{x:cell.x+r.x,y:cell.y-cell.imageHeight+(cell.imageHeight-r.height)/2,width:r.width,height:r.height});
      cell.lines.forEach((line,j)=>page.drawText(line,{x:cell.x,y:cell.y-cell.imageHeight-16-j*12,size:9,font,color:rgb(.08,.13,.21)}));
    }
  }
  return {bytes:await doc.save(),pages:plan.pages.length};
}
