export type Shift = { code: string; kind: 'work' | 'off'; start: string; end: string };
export type Plan = { month: string; text: string; zone: string; shifts: Shift[] };
export type Day = { date: string; original: string; code: string; start?: string; end?: string; startUtc?: number; endUtc?: number; off?: boolean; error?: string };
export const EXAMPLE_ROW = 'D D N N OFF OFF D D N N OFF OFF D D N N OFF OFF D D N N OFF OFF D D N N OFF OFF';
export const DEFAULT_SHIFTS: Shift[] = [{code:'D',kind:'work',start:'07:00',end:'19:00'},{code:'N',kind:'work',start:'19:00',end:'07:00'},{code:'OFF',kind:'off',start:'',end:''}];
export function monthDays(month: string) {
  if(typeof month !== 'string' || !/^(20\d\d|2100)-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Choose a month from 2000 through 2100.');
  const [y,m]=month.split('-').map(Number); return new Date(Date.UTC(y,m,0)).getUTCDate();
}
function cells(line: string): string[] { return line.includes('\t') ? line.split('\t') : line.includes(',') ? line.split(',') : line.trim().split(/ +/); }
export function parseRow(text: string): {cells:string[]; header?:string[]} {
  if(typeof text !== 'string' || text.length > 8000) throw new Error('Paste up to 8,000 characters.');
  if(!text.trim()) return {cells:[]};
  const normalized=text.replace(/\r\n?/g,'\n').replace(/\n$/,'');
  const lines=normalized.split('\n');
  if(lines.length===2 && cells(lines[0]).length>1 && cells(lines[0]).every(x=>/^\d+$/.test(x.trim()))) return {cells:cells(lines[1]),header:cells(lines[0])};
  if(lines.length===1) return {cells:cells(lines[0])};
  if(lines.every(line=>!/[\t, ]/.test(line.trim()))) return {cells:lines};
  throw new Error('Paste only your row, or a day-number row followed by your row. One code per line also works.');
}
const pad=(n:number)=>String(n).padStart(2,'0');
function dateAt(month:string,day:number){const [y,m]=month.split('-').map(Number);const d=new Date(Date.UTC(y,m-1,day));return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;}
function formatter(zone:string){return new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});}
function localParts(ms:number,fmt:Intl.DateTimeFormat){const p=Object.fromEntries(fmt.formatToParts(ms).map(p=>[p.type,p.value]));return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;}
export function resolveWall(date:string,time:string,zone:string):number {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('Use a valid date and 24-hour time.');
  const target=`${date}T${time}`,guess=Date.parse(target+':00Z'),fmt=formatter(zone),offsets=new Set<number>();
  for(const h of [-48,-24,0,24,48]){const t=guess+h*3600000;offsets.add(Date.parse(localParts(t,fmt)+':00Z')-t);}
  const matches=[...offsets].map(offset=>guess-offset).filter(t=>localParts(t,fmt)===target);
  if(matches.length!==1)throw new Error(matches.length?'This time occurs twice when clocks change. Resolve this day in your calendar.':'This local time does not exist when clocks change. Resolve this day in your calendar.');
  return matches[0];
}
export function reviewPlan(plan:Plan):{days:Day[];errors:string[];count:number;workCount:number} {
  const errors:string[]=[],days:Day[]=[];
  try {
    if(!plan||typeof plan!=='object')throw new Error('Provide a monthly plan.');
    const count=monthDays(plan.month),parsed=parseRow(plan.text);
    if(typeof plan.zone!=='string'||plan.zone.length>100)throw new Error('Choose a valid work time zone.');
    try{formatter(plan.zone).format(0);}catch{throw new Error('Choose a valid work time zone, such as Europe/London.');}
    if(!Array.isArray(plan.shifts)||plan.shifts.length>31)throw new Error('Use at most 31 shift codes.');
    const map=new Map<string,Shift>();
    for(const s of plan.shifts){if(!s||typeof s.code!=='string'||s.code.length>32||!s.code.trim()||/[\s,\x00-\x1f\x7f]/.test(s.code))throw new Error('Shift codes must be 1–32 characters without spaces or separators.');if(map.has(s.code))throw new Error('Each shift code needs one definition.');if(!['work','off'].includes(s.kind))throw new Error('Mark each code as work or a day off.');map.set(s.code,s);}
    if(parsed.cells.length!==count)errors.push(`${plan.month} needs ${count} day cells; you pasted ${parsed.cells.length}. Include every day, using an explicit code for days off.`);
    if(parsed.header && (parsed.header.length!==count||parsed.header.some((v,i)=>Number(v.trim())!==i+1)))errors.push(`The day-number row must run from 1 to ${count}, with no missing or repeated day.`);
    if(parsed.cells.length>31)throw new Error('Only one month, up to 31 day cells, can be reviewed.');
    parsed.cells.forEach((raw,i)=>{
      const day:Day={date:dateAt(plan.month,i+1),original:raw,code:raw.trim()}; days.push(day);
      try{
        if(!day.code)throw new Error('Empty cell. Enter an explicit work or day-off code.');
        const shift=map.get(day.code);if(!shift)throw new Error('Unknown code. Define its hours or mark it as a day off.');
        if(shift.kind==='off'){day.off=true;return;}
        if(typeof shift.start!=='string'||typeof shift.end!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(shift.start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(shift.end))throw new Error('Set both start and end times in 24-hour format.');
        if(shift.start===shift.end)throw new Error('Equal start and end is ambiguous. This tool supports shifts shorter than 24 hours.');
        const endDate=shift.end<shift.start?dateAt(plan.month,i+2):day.date;
        day.start=`${day.date} ${shift.start}`;day.end=`${endDate} ${shift.end}`;
        day.startUtc=resolveWall(day.date,shift.start,plan.zone);day.endUtc=resolveWall(endDate,shift.end,plan.zone);
        if(day.endUtc<=day.startUtc)throw new Error('The end must be after the start in the work time zone.');
      }catch(e){day.error=(e as Error).message;}
    });
    days.forEach(d=>{if(d.error)errors.push(`${d.date}: ${d.error}`);});
    const work=days.filter(d=>d.startUtc!==undefined&&!d.error).sort((a,b)=>a.startUtc!-b.startUtc!);
    for(let i=1;i<work.length;i++)if(work[i].startUtc!<work[i-1].endUtc!)errors.push(`${work[i].date}: this shift overlaps the previous shift. Check both code definitions.`);
    return {days,errors,count,workCount:work.length};
  }catch(e){errors.push((e as Error).message);return {days,errors,count:0,workCount:0};}
}
function escapeText(value:string){return value.replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
function fold(line:string){let out='',part='',bytes=0;for(const char of line){const n=new TextEncoder().encode(char).length;if(bytes+n>75){out+=part+'\r\n';part=' ';bytes=1;}part+=char;bytes+=n;}return out+part;}
const stamp=(ms:number)=>new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
export async function createCalendar(plan:Plan):Promise<string> {
  // Snapshot before the first await: edits cannot mix two different plans in one file.
  const snapshot=JSON.parse(JSON.stringify(plan)) as Plan,review=reviewPlan(snapshot);
  if(review.errors.length)throw new Error('Resolve every review issue before downloading.');
  if(!review.workCount)throw new Error('There are no work events to export.');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//HWANSEEK//Shift Calendar Review//EN','CALSCALE:GREGORIAN'],dtstamp=stamp(Date.now());
  for(const day of review.days){if(day.off)continue;
    const id=JSON.stringify([snapshot.month,snapshot.zone,day.date,day.code,day.start,day.end]);
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id)))).map(b=>b.toString(16).padStart(2,'0')).join('');
    lines.push('BEGIN:VEVENT',`UID:${hash}@hwanseek.tools`,`DTSTAMP:${dtstamp}`,`DTSTART:${stamp(day.startUtc!)}`,`DTEND:${stamp(day.endUtc!)}`,`SUMMARY:${escapeText(day.code+' shift')}`,`DESCRIPTION:${escapeText(`Work time zone: ${snapshot.zone}. ${day.start} to ${day.end}. Imported file; not a live sync.`)}`,'END:VEVENT');
  }
  lines.push('END:VCALENDAR');return lines.map(fold).join('\r\n')+'\r\n';
}
