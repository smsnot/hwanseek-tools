'use client';
import { useMemo, useRef, useState } from 'react';
import { ToolNav } from '@/components/tool-frame';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { compareLists, countReport, listError, LIST_EXAMPLE_A, LIST_EXAMPLE_B, type Occurrence } from '@/lib/list-counts';

function SourceLines({ values }: { values: Occurrence[] }) {
  if (!values.length) return <span className="muted">—</span>;
  const lines = values.map(x => x.line).join(', ');
  return <details className="source-lines"><summary>{values.length > 8 ? `${values.slice(0, 8).map(x => x.line).join(', ')}…` : lines}<span className="source-detail-label">View originals</span></summary><div className="source-values">{values.map(x => <div key={x.line}><span>Line {x.line}:</span> <code>{JSON.stringify(x.value)}</code></div>)}</div></details>;
}
export default function ListCountReview() {
  const [a, setA] = useState(LIST_EXAMPLE_A), [b, setB] = useState(LIST_EXAMPLE_B);
  const [ignoreCase, setIgnoreCase] = useState(false), [trimEdges, setTrimEdges] = useState(false);
  const [differencesOnly, setDifferencesOnly] = useState(true), [page, setPage] = useState(0);
  const [message, setMessage] = useState(''), [showReport, setShowReport] = useState(false);
  const reportRef = useRef<HTMLTextAreaElement>(null);
  const error = listError(a, 'List A') || listError(b, 'List B');
  const result = useMemo(() => error ? null : compareLists(a, b, { ignoreCase, trimEdges }), [a, b, ignoreCase, trimEdges, error]);
  const filtered = result?.rows.filter(row => !differencesOnly || row.delta !== 0) || [];
  const pages = Math.max(1, Math.ceil(filtered.length / 50));
  const safePage = Math.min(page, pages - 1);
  const report = useMemo(() => result ? countReport(result, { ignoreCase, trimEdges }, differencesOnly) : '', [result, ignoreCase, trimEdges, differencesOnly]);
  function resetView() { setPage(0); setMessage(''); setShowReport(false); }
  async function copyReport() {
    try { await navigator.clipboard.writeText(report); setMessage('Comparison copied as a plain-text report.'); }
    catch { setShowReport(true); setMessage('Copy was blocked. Select the report below and use your device’s Copy command.'); }
  }
  return <div className="site-shell list-count-tool">
    <header className="site-header"><a className="wordmark" href="/">HWAN<span>SEEK</span><span className="brand-dot" aria-hidden="true" /></a><nav aria-label="Main"><a href="https://hwanseek.blogspot.com/">Field notes ↗</a><a href="https://github.com/smsnot/hwanseek-tools">Source ↗</a></nav></header>
    <main id="main">
      <ToolNav current="/list-count-review" />
      <div className="title-row"><div><p className="eyebrow">TOOL 002 / LISTS</p><h1>List count review</h1><p className="intro">Same items, different counts? Find the gap. Trace it to your input.</p></div><span className="local-badge">Free · runs in your browser</span></div>
      <section className="workspace list-inputs" aria-label="Two lists to compare">
        <div className="editor-panel"><div className="panel-top"><label htmlFor="list-a"><span className="step">A</span> List A</label><Button variant="ghost" onClick={() => { setA(LIST_EXAMPLE_A); setB(LIST_EXAMPLE_B); setIgnoreCase(false); setTrimEdges(false); resetView(); }}>Load example</Button></div><Textarea id="list-a" value={a} onChange={e => { setA(e.target.value); resetView(); }} spellCheck={false} aria-describedby="list-hint" placeholder="One item per line…" /><div className="panel-bottom"><span>{result ? `${result.totalA} items · ${result.skippedA} blank lines skipped` : `${a.length.toLocaleString()} characters`}</span><Button variant="ghost" disabled={!a} onClick={() => { setA(''); resetView(); }}>Clear A</Button></div></div>
        <div className="editor-panel result-panel"><div className="panel-top"><label htmlFor="list-b"><span className="step">B</span> List B</label><Button variant="ghost" onClick={() => { setA(b); setB(a); resetView(); }}>Swap A / B</Button></div><Textarea id="list-b" value={b} onChange={e => { setB(e.target.value); resetView(); }} spellCheck={false} aria-describedby="list-hint" placeholder="One item per line…" /><div className="panel-bottom"><span>{result ? `${result.totalB} items · ${result.skippedB} blank lines skipped` : `${b.length.toLocaleString()} characters`}</span><Button variant="ghost" disabled={!b} onClick={() => { setB(''); resetView(); }}>Clear B</Button></div></div>
      </section>
      <p id="list-hint" className="list-hint">One item per line; order does not affect counts. Blank and whitespace-only lines are skipped. Up to 2,000 lines and 100,000 characters per list.</p>
      <div className="matching-rules" role="group" aria-label="Matching rules"><span>Match rules</span><label><Checkbox checked={ignoreCase} onCheckedChange={value => { setIgnoreCase(value === true); resetView(); }} />Ignore case</label><label><Checkbox checked={trimEdges} onCheckedChange={value => { setTrimEdges(value === true); resetView(); }} />Ignore surrounding whitespace</label></div>
      <p className="list-hint">{!ignoreCase && !trimEdges ? 'Exact text matching is on. ' : 'Selected matching rules are on. Expand input lines to see original values. '}IDs stay as text: <code>001</code> and <code>1</code> are different items.</p>
      {error && <p role="alert" className="error">{error} No partial result is shown.</p>}
      {result && <section className="review count-review" aria-labelledby="count-heading">
        <div className="review-heading"><div><h2 id="count-heading">{result.rows.length ? result.extraA || result.extraB ? `${filtered.length} ${differencesOnly ? 'items with different counts' : 'items'}` : 'Counts balance' : 'Paste a list to begin'}</h2><p>{result.extraA} extra {result.extraA === 1 ? 'occurrence' : 'occurrences'} in A · {result.extraB} extra {result.extraB === 1 ? 'occurrence' : 'occurrences'} in B</p></div><div className="review-actions"><label className="filter-label"><Checkbox checked={differencesOnly} onCheckedChange={value => { setDifferencesOnly(value === true); resetView(); }} />Differences only</label><Button disabled={!result.rows.length} onClick={copyReport}>Copy comparison</Button></div></div>
        {filtered.length ? <Table className="count-table"><TableHeader><TableRow><TableHead scope="col">Item / matching key</TableHead><TableHead scope="col">Count A</TableHead><TableHead scope="col">Count B</TableHead><TableHead scope="col">Difference</TableHead><TableHead scope="col">A input lines</TableHead><TableHead scope="col">B input lines</TableHead></TableRow></TableHeader><TableBody>{filtered.slice(safePage * 50, (safePage + 1) * 50).map(row => <TableRow key={row.key}><TableCell><code className="item-key">{JSON.stringify(row.key)}</code></TableCell><TableCell>{row.a.length}</TableCell><TableCell>{row.b.length}</TableCell><TableCell><span className={row.delta ? 'count-gap' : 'muted'}>{row.delta > 0 ? `${row.delta} extra in A` : row.delta < 0 ? `${-row.delta} extra in B` : 'Balanced'}</span></TableCell><TableCell><SourceLines values={row.a} /></TableCell><TableCell><SourceLines values={row.b} /></TableCell></TableRow>)}</TableBody></Table> : <p className="empty-note">{result.rows.length ? 'Every item has the same count in both lists under the selected rules. Turn off “Differences only” to inspect all items.' : 'Your comparison will appear here. Try the example above.'}</p>}
        {pages > 1 && <div className="panel-bottom"><span>Page {safePage + 1} of {pages} · {filtered.length} items total</span><div className="review-actions"><Button variant="outline" disabled={!safePage} onClick={() => setPage(safePage - 1)}>Previous</Button><Button variant="outline" disabled={safePage + 1 >= pages} onClick={() => setPage(safePage + 1)}>Next</Button></div></div>}
        <p className="table-note">Line numbers include skipped blanks and refer to the pasted input. They show all occurrences of an item; they cannot tell you which duplicate is incorrect. Copy includes every page in the selected view.</p>
      </section>}
      <p className="status" role="status" aria-live="polite">{message || 'Results update as you type. Your input stays unchanged.'}</p>
      {showReport && <section className="copy-fallback"><label htmlFor="count-report">Plain-text comparison</label><Textarea id="count-report" ref={reportRef} readOnly value={report} /><Button variant="outline" onClick={() => { reportRef.current?.focus(); reportRef.current?.select(); }}>Select report</Button></section>}
      <div className="notes-grid"><section><p className="eyebrow">HOW TO USE</p><h2>Paste. Compare. Trace.</h2><ol><li>Copy a single column from each source, without its header. Paste one item per line.</li><li>Check the counts and extra occurrences. Only enable case or surrounding-whitespace matching when those differences do not matter.</li><li>Expand an input-line cell to inspect the original values. Review the source before changing records, or copy the comparison.</li></ol></section><section><p className="eyebrow">WHERE IT STOPS</p><h2>A count is one part of the check.</h2><p>Matching counts do not prove two records describe the same person, payment, or product. This tool does not fix typos, compare row order, read Excel files, parse CSV columns, or sum a quantity column.</p><p>Quotes make spaces visible; escaped characters such as <code>\t</code> represent tabs inside an item. Case matching uses JavaScript lowercase, not language-aware name matching. Unicode look-alikes are not merged.</p></section></div>
      <details className="privacy"><summary>What happens to my lists?</summary><p>Lists are processed in this browser tab. The tool does not upload pasted lists, call an AI service, or save them in browser storage. Reloading resets the tool. Hosting still involves ordinary page requests. External links have their own policies.</p></details>
    </main><footer><span>HWANSEEK · Small tools for everyday problems</span><a href="https://www.instagram.com/hwan_seek/">Follow the experiments ↗</a></footer>
  </div>;
}

