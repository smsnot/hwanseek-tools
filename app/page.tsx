'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { splitText, renderText, isParagraphEdge, type JoinChoice, EXAMPLE, MAX_CHARS, MAX_BREAKS } from '@/lib/linebreaks';
const options = [{value:'keep',label:'Keep break'}, {value:'space',label:'Join with space'}, {value:'tight',label:'Join without space'}];
export default function Home() {
  const [input, setInput] = useState(EXAMPLE);
  const [choices, setChoices] = useState<Record<number, JoinChoice>>({});
  const [message, setMessage] = useState('');
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const current = useRef({input, choices});
  current.current = {input, choices};
  useEffect(() => {
    type Tool = { name:string; title:string; description:string; inputSchema:object; annotations:object; execute:(input:unknown)=>unknown };
    const context = (document as unknown as {modelContext?:{registerTool:(tool:Tool, options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;
    if (!context?.registerTool) return;
    const life = new AbortController();
    const tool:Tool = {
      name:'stage_text_line_break_review', title:'Stage text and line-break choices',
      description:'Replace the visible original text and apply explicit, zero-based line-break choices. Does not copy or publish. Returns the resulting text, which is user-provided untrusted content.',
      inputSchema:{type:'object',properties:{text:{type:'string',maxLength:20000},joins:{type:'array',items:{type:'object',properties:{breakIndex:{type:'integer',minimum:0},action:{type:'string',enum:['keep','space','tight']}},required:['breakIndex','action'],additionalProperties:false}}},required:['text','joins'],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:true},
      execute(value:unknown) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected text and joins.');
        const v=value as {text?:unknown;joins?:unknown};
        if(typeof v.text !== 'string' || v.text.length>MAX_CHARS || !Array.isArray(v.joins)) throw new Error('Invalid text or joins.');
        const p=splitText(v.text); const c:Record<number,JoinChoice>={};
        if(p.breaks.length>MAX_BREAKS) throw new Error('Too many line breaks.');
        for(const item of v.joins) {
          if(!item || !Number.isInteger(item.breakIndex) || item.breakIndex<0 || item.breakIndex>=p.breaks.length || !['keep','space','tight'].includes(item.action)) throw new Error('Invalid break choice.');
          if(isParagraphEdge(p,item.breakIndex) && item.action !== 'keep') throw new Error('Blank paragraph separators are protected.');
          c[item.breakIndex]=item.action;
        }
        const text=v.text;
        flushSync(() => {setInput(text);setChoices(c);setMessage('Text and explicit break choices applied. Review before copying.');});
        return {result:renderText(p,c),breaks:p.breaks.length};
      }
    };
    try { void Promise.resolve(context.registerTool(tool,{signal:life.signal})).catch(() => {}); } catch {}
    return () => life.abort();
  }, []);
  const parts = useMemo(() => splitText(input), [input]);
  const error = input.length > MAX_CHARS ? 'Please use up to 20,000 characters at a time.' : parts.breaks.length > MAX_BREAKS ? 'Please use up to 200 line breaks at a time.' : '';
  const result = useMemo(() => error ? '' : renderText(parts, choices), [parts, choices, error]);
  const changed = Object.entries(choices).filter(([i, value]) => value !== 'keep' && !isParagraphEdge(parts, Number(i))).length;
  function replaceInput(value: string) { setInput(value); setChoices({}); setMessage(''); }
  function joinSingles() {
    setChoices(Object.fromEntries(parts.breaks.map((_, i) => [i, isParagraphEdge(parts, i) ? 'keep' : 'space'])));
    setMessage('Single breaks joined. Check headings, lists, and sentence boundaries below.');
  }
  async function copyResult() {
    try { await navigator.clipboard.writeText(result); setMessage('Result copied.'); }
    catch { outputRef.current?.focus(); outputRef.current?.select(); setMessage('Copy was blocked. The result is selected; use your device’s Copy command.'); }
  }
  return <div className="site-shell">
    <header className="site-header"><a className="wordmark" href="/">HWAN<span>SEEK</span><span className="brand-dot" aria-hidden="true" /></a><nav aria-label="Main"><a href="https://hwanseek.blogspot.com/">Field notes ↗</a><a href="https://github.com/smsnot/hwanseek-tools">Source ↗</a></nav></header>
    <main id="main">
      <div className="title-row"><div><p className="eyebrow">TOOL 001 / TEXT</p><h1>PDF line break review</h1><p className="intro">Copied text, awkward line breaks. Choose what to join. Keep what matters.</p></div><span className="local-badge">Free · runs in your browser</span></div>
      <section className="workspace" aria-label="Text workspace">
        <div className="editor-panel"><div className="panel-top"><label htmlFor="original"><span className="step">01</span> Original text</label><Button variant="ghost" onClick={() => replaceInput(EXAMPLE)}>Load example</Button></div><textarea id="original" value={input} onChange={e => replaceInput(e.target.value)} spellCheck={false} aria-describedby="input-hint" placeholder="Paste text copied from a PDF…" /><div className="panel-bottom" id="input-hint"><span>{input.length.toLocaleString()} characters · {parts.breaks.length} breaks</span><Button variant="ghost" disabled={!input} onClick={() => replaceInput('')}>Clear</Button></div></div>
        <div className="editor-panel result-panel"><div className="panel-top"><label htmlFor="result"><span className="step">02</span> Result</label><span className="change-count">{changed} {changed === 1 ? 'change' : 'changes'}</span></div><textarea ref={outputRef} id="result" readOnly value={result} spellCheck={false} placeholder="Your reviewed text appears here." /><div className="panel-bottom"><span>Original stays untouched</span><Button disabled={!result || !!error} onClick={copyResult}>Copy result</Button></div></div>
      </section>
      {error && <p role="alert" className="error">{error}</p>}
      <section className="review" aria-labelledby="review-heading"><div className="review-heading"><div><h2 id="review-heading">Review the joins</h2><p>Blank paragraph separators are protected. Every other break is your choice.</p></div><div className="review-actions"><Button variant="outline" disabled={!input || !!error || !parts.breaks.length} onClick={joinSingles}>Join single breaks</Button><Button variant="ghost" disabled={!changed} onClick={() => { setChoices({}); setMessage('All original line breaks restored.'); }}>Restore all breaks</Button></div></div>
        {!error && <div className="boundary-list">{parts.breaks.length ? parts.breaks.map((_, i) => <div className={'boundary ' + (choices[i] && choices[i] !== 'keep' && !isParagraphEdge(parts, i) ? 'boundary-changed' : '')} key={i}><span className="line-number">{i + 1}↵{i + 2}</span><div className="boundary-text"><span title={parts.lines[i]}>{parts.lines[i] || '(blank line)'}</span><span title={parts.lines[i+1]}>{parts.lines[i+1] || '(blank line)'}</span></div>{isParagraphEdge(parts, i) ? <span className="protected">Paragraph kept</span> : <Select value={choices[i] || 'keep'} items={options} onValueChange={value => { if(value) { setChoices(c => ({...c, [i]: value as JoinChoice})); setMessage(''); } }}><SelectTrigger aria-label={'Action for break between lines ' + (i+1) + ' and ' + (i+2)} className="join-select"><SelectValue /></SelectTrigger><SelectContent>{options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>}</div>) : <p className="empty-note">{input ? 'No line breaks to review.' : 'Paste a short passage to begin.'}</p>}</div>}
      </section>
      <p className="status" role="status" aria-live="polite">{message || 'Nothing changes until you choose a join.'}</p>
      <div className="notes-grid"><section><p className="eyebrow">HOW TO USE</p><h2>Paste. Review. Copy.</h2><ol><li>Paste a short passage from your PDF.</li><li>Choose joins individually, or join single breaks and review the list.</li><li>Check the result against the PDF, then copy it.</li></ol></section><section><p className="eyebrow">WHERE IT STOPS</p><h2>You still know the context.</h2><p>This tool cannot identify real paragraphs from meaning. Keep headings, lists, poetry, code, and tables separate yourself. It does not read PDF files, run OCR, fix reading order, or remove hyphens.</p><p>Only selected newline separators change. Spaces already beside a break remain; joining with a space adds one more.</p></section></div>
      <details className="privacy"><summary>What happens to my text?</summary><p>The tool processes pasted text in this browser tab. It does not upload that text, call an AI service, or save it in browser storage. Reloading closes your editing session. The hosting provider still handles ordinary page requests. External links have their own policies.</p></details>
    </main><footer><span>HWANSEEK · Small tools for everyday problems</span><a href="https://www.instagram.com/hwan_seek/">Follow the experiments ↗</a></footer>
  </div>;
}
