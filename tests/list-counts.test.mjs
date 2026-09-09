import test from 'node:test';
import assert from 'node:assert/strict';
import { compareLists, countReport, listError } from '../lib/list-counts.ts';
const exact = { ignoreCase: false, trimEdges: false };
const counts = r => r.rows.map(x => [x.key, x.a.length, x.b.length, x.delta]);
test('identical unique membership can hide two opposite count gaps', () => {
  const r = compareLists('A100\nA100\nB200', 'A100\nB200\nB200', exact);
  assert.deepEqual(counts(r), [['A100', 2, 1, 1], ['B200', 1, 2, -1]]);
  assert.deepEqual([r.extraA, r.extraB, r.totalA, r.totalB], [1, 1, 3, 3]);
  assert.deepEqual(r.rows[0].a.map(x => x.line), [1, 2]);
});
test('reordered occurrences balance without treating row order as identity', () => {
  const r = compareLists('A\nB\nA', 'A\nA\nB', exact);
  assert.equal(r.extraA + r.extraB, 0);
  assert.deepEqual(counts(r), [['A', 2, 2, 0], ['B', 1, 1, 0]]);
});
test('Reddit-style duplicate case retains the excess occurrence in B', () => {
  const r = compareLists('1\n2\n3\n4\n1\n2', '1\n2\n3\n3\n1\n2', exact);
  assert.deepEqual(counts(r), [['1', 2, 2, 0], ['2', 2, 2, 0], ['3', 1, 2, -1], ['4', 1, 0, 1]]);
});
test('IDs are strings; prototype property names are ordinary items', () => {
  assert.deepEqual(counts(compareLists('001\n1\n__proto__\nconstructor', '1\n__proto__', exact)), [['001', 1, 0, 1], ['1', 1, 1, 0], ['__proto__', 1, 1, 0], ['constructor', 1, 0, 1]]);
});
test('blank lines are skipped but source positions and raw values survive CRLF and CR', () => {
  const r = compareLists('\r\n X \r\n\t\rY\n', 'X\nY', exact);
  assert.deepEqual(r.rows[0].a, [{ value: ' X ', line: 2 }]);
  assert.deepEqual(r.rows[1].a, [{ value: 'Y', line: 4 }]);
  assert.deepEqual([r.totalA, r.skippedA], [2, 3]);
});
test('optional normalization is explicit, preserves variants, and does not collapse internal spaces or look-alikes', () => {
  const r = compareLists(' A \na\nA  B\nＡ', 'a\na\nA B\nA', { ignoreCase: true, trimEdges: true });
  assert.deepEqual(counts(r), [['a', 2, 3, -1], ['a  b', 1, 0, 1], ['ａ', 1, 0, 1], ['a b', 0, 1, -1]]);
  assert.deepEqual(r.rows[0].a.map(x => x.value), [' A ', 'a']);
  assert.equal(compareLists(' X ', 'X', exact).rows.length, 2);
  assert.equal(compareLists('X', 'x', exact).rows.length, 2);
});
test('empty and one-sided inputs do not produce phantom items', () => {
  assert.equal(compareLists('', '', exact).rows.length, 0);
  assert.deepEqual(counts(compareLists('', 'A\nA', exact)), [['A', 0, 2, -2]]);
});
test('limits reject whole input instead of silently truncating', () => {
  assert.equal(listError('A\n'.repeat(1999) + 'A', 'A'), '');
  assert.notEqual(listError('A\n'.repeat(2000) + 'A', 'A'), '');
  assert.throws(() => compareLists('A'.repeat(100001), 'A', exact), /100,000/);
});
test('copy report includes all selected rows and quotes original strings with a safe text prefix', () => {
  const r = compareLists('=1+1\nA\nA', '=1+1\nA', exact);
  const diff = countReport(r, exact, true), all = countReport(r, exact, false);
  assert.ok(!diff.includes('Item: "=1+1"'));
  assert.ok(all.includes('Item: "=1+1"'));
  assert.ok(diff.includes('A input lines: 2, 3'));
  assert.ok(diff.includes('Count A: 2; Count B: 1; A minus B: 1'));
});
test('count conservation across 2000 lines and 173 overlapping items', () => {
  const a = Array.from({ length: 2000 }, (_, i) => `ID-${i % 173}`);
  const b = [...a.slice(0, 1950).reverse(), 'other', 'other'];
  const r = compareLists(a.join('\n'), b.join('\n'), exact);
  assert.equal(r.rows.reduce((n, x) => n + x.a.length, 0), a.length);
  assert.equal(r.rows.reduce((n, x) => n + x.b.length, 0), b.length);
  assert.equal(r.extraA - r.extraB, a.length - b.length);
  assert.equal(r.extraA, 50); assert.equal(r.extraB, 2);
});
