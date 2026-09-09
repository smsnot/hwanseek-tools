import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {DEFAULT_SHIFTS,EXAMPLE_ROW,parseRow,reviewPlan,createCalendar,resolveWall} from '../lib/shift-calendar.ts';
const example=()=>({month:'2026-09',text:EXAMPLE_ROW,zone:'Asia/Seoul',shifts:structuredClone(DEFAULT_SHIFTS)});
const row=(month,codes,zone='Asia/Seoul',shifts=DEFAULT_SHIFTS)=>({month,text:codes.join('\t'),zone,shifts:structuredClone(shifts)});
test('September: all 30 original day positions, 20 work shifts, OFF excluded',async()=>{
  const p=example(),r=reviewPlan(p);assert.deepEqual(r.errors,[]);assert.equal(r.days.length,30);assert.equal(r.workCount,20);assert.equal(r.days[2].start,'2026-09-03 19:00');assert.equal(r.days[2].end,'2026-09-04 07:00');
  const ics=await createCalendar(p);assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,20);assert.ok(ics.includes('DTSTART:20260901T220000Z'));assert.ok(!ics.includes('OFF shift'));
});
test('Empty spreadsheet cells keep their dates and block export',async()=>{
  const cells=EXAMPLE_ROW.split(' ');cells[1]='';const p=row('2026-09',cells),r=reviewPlan(p);assert.equal(r.days[1].date,'2026-09-02');assert.match(r.days[1].error,/Empty cell/);assert.equal(r.days[2].code,'N');assert.equal(r.days[2].date,'2026-09-03');await assert.rejects(createCalendar(p));
  assert.deepEqual(parseRow('D\n\nN\n').cells,['D','','N']);assert.deepEqual(parseRow('D,,N').cells,['D','','N']);
});
test('Missing day cannot silently compress a 30-day month; headers must match',()=>{
  const p=example();p.text=p.text.split(' ').slice(1).join(' ');assert.match(reviewPlan(p).errors[0],/30 day cells.*29/);
  p.text=Array.from({length:30},(_,i)=>i+1).join('\t')+'\n'+EXAMPLE_ROW.split(' ').join('\t');assert.equal(reviewPlan(p).errors.length,0);
  p.text=p.text.replace(/^1\t2\t/,'1\t3\t');assert.match(reviewPlan(p).errors[0],/day-number row/);
});
test('Unknown or differently cased codes block, never become all-day events',async()=>{
  const p=example();p.text=p.text.replace(/^D/,'d');assert.match(reviewPlan(p).days[0].error,/Unknown/);await assert.rejects(createCalendar(p));
});
test('Leap February and last-night rollover into March and next year',()=>{
  for(const [month,count,lastEnd] of [['2028-02',29,'2028-03-01 07:00'],['2026-12',31,'2027-01-01 07:00']]){const codes=Array(count).fill('OFF');codes[count-1]='N';const r=reviewPlan(row(month,codes));assert.deepEqual(r.errors,[]);assert.equal(r.days.at(-1).end,lastEnd);}
});
test('DST nonexistent and repeated local times stop export, ordinary shifts retain instant',()=>{
  assert.throws(()=>resolveWall('2026-03-08','02:30','America/New_York'),/does not exist/);
  assert.throws(()=>resolveWall('2026-11-01','01:30','America/New_York'),/occurs twice/);
  assert.equal(new Date(resolveWall('2026-03-08','03:30','America/New_York')).toISOString(),'2026-03-08T07:30:00.000Z');
  assert.equal(new Date(resolveWall('2026-09-01','07:00','Asia/Kolkata')).toISOString(),'2026-09-01T01:30:00.000Z');
});
test('Equal hours, adjacent overlaps, null, infinity, negative month, types, oversized input',async()=>{
  const p=example();p.shifts[0].end='07:00';assert.ok(reviewPlan(p).errors.length);
  p.shifts=structuredClone(DEFAULT_SHIFTS);p.shifts[1].end='09:00';p.text=['N',...Array(29).fill('D')].join(' ');assert.ok(reviewPlan(p).errors.some(e=>/overlaps/.test(e)));
  for(const bad of [null,{...example(),text:null},{...example(),text:Infinity},{...example(),month:'-1-09'},{...example(),shifts:[null]},{...example(),zone:'BAD/Z0NE'},{...example(),text:'D'.repeat(8001)},{...example(),shifts:[{code:'D',kind:'work',start:-1,end:null}]}]){assert.ok(reviewPlan(bad).errors.length);await assert.rejects(createCalendar(bad));}
});
test('Code injection and prototype names cannot add calendar properties; UTF-8 folding',async()=>{
  const codes=Array(30).fill('OFF'),code='夜班;VALARM\\測試測試測試測試測試測試';codes[0]=code;codes[1]='__proto__';const shifts=[...DEFAULT_SHIFTS,{code,kind:'work',start:'08:00',end:'09:00'},{code:'__proto__',kind:'work',start:'08:00',end:'09:00'}];
  const ics=await createCalendar(row('2026-09',codes,'Asia/Seoul',shifts));assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,2);assert.ok(!ics.includes('\r\nBEGIN:VALARM'));for(const line of ics.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);assert.ok(ics.includes('\\;VALARM\\\\'));
  const p=example();p.shifts.push({code:'X\r\nBEGIN:VEVENT',kind:'off',start:'',end:''});assert.ok(reviewPlan(p).errors.length);
});
test('Export snapshots the complete plan before awaits; same data has stable UIDs',async()=>{
  const p=example(),pending=createCalendar(p);p.text='BROKEN';p.shifts[0].start='00:00';const first=await pending,second=await createCalendar(example());assert.deepEqual(first.match(/^UID:.+$/gm),second.match(/^UID:.+$/gm));assert.equal((first.match(/BEGIN:VEVENT/g)||[]).length,20);assert.ok(!first.includes('BROKEN'));
});
test('All-off month is valid review but cannot create an empty misleading calendar',async()=>{
  const p=row('2026-09',Array(30).fill('OFF'));assert.equal(reviewPlan(p).errors.length,0);await assert.rejects(createCalendar(p),/no work events/);
});
if(process.env.SHIFT_FIXTURE_OUT){const p=row('2028-02',Array.from({length:29},(_,i)=>i===28?'N':'OFF'));writeFileSync(process.env.SHIFT_FIXTURE_OUT,await createCalendar(p),'utf8');}
