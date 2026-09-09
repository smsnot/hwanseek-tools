export const LIST_MAX_CHARS = 100000;
export const LIST_MAX_LINES = 2000;
export const LIST_EXAMPLE_A = 'A100\nA100\nB200';
export const LIST_EXAMPLE_B = 'A100\nB200\nB200';
export type MatchRules = { ignoreCase: boolean; trimEdges: boolean };
export type Occurrence = { value: string; line: number };
export type CountRow = { key: string; a: Occurrence[]; b: Occurrence[]; delta: number };
export type CountResult = { rows: CountRow[]; totalA: number; totalB: number; skippedA: number; skippedB: number; extraA: number; extraB: number };
export function listError(text: string, label: string): string {
  if (text.length > LIST_MAX_CHARS) return `${label}: use up to 100,000 characters.`;
  if (text.split(/\r\n|\r|\n/, LIST_MAX_LINES + 1).length > LIST_MAX_LINES) return `${label}: use up to 2,000 input lines (including blank lines).`;
  return '';
}
export function compareLists(textA: string, textB: string, rules: MatchRules): CountResult {
  const error = listError(textA, 'List A') || listError(textB, 'List B');
  if (error) throw new Error(error);
  const rows = new Map<string, CountRow>();
  function add(text: string, side: 'a' | 'b') {
    let total = 0, skipped = 0;
    if (!text) return { total, skipped };
    text.split(/\r\n|\r|\n/).forEach((value, index) => {
      // Empty and whitespace-only lines never represent items. Keep their source positions.
      if (!value.trim()) { skipped++; return; }
      let key = rules.trimEdges ? value.trim() : value;
      if (rules.ignoreCase) key = key.toLowerCase();
      let row = rows.get(key);
      if (!row) { row = { key, a: [], b: [], delta: 0 }; rows.set(key, row); }
      row[side].push({ value, line: index + 1 }); total++;
    });
    return { total, skipped };
  }
  const a = add(textA, 'a'), b = add(textB, 'b');
  let extraA = 0, extraB = 0;
  for (const row of rows.values()) {
    row.delta = row.a.length - row.b.length;
    extraA += Math.max(row.delta, 0); extraB += Math.max(-row.delta, 0);
  }
  return { rows: [...rows.values()], totalA: a.total, totalB: b.total, skippedA: a.skipped, skippedB: b.skipped, extraA, extraB };
}
export function countReport(result: CountResult, rules: MatchRules, differencesOnly: boolean): string {
  const selected = result.rows.filter(row => !differencesOnly || row.delta !== 0);
  return [
    'HWANSEEK — List Count Review',
    `Rules: ${rules.ignoreCase ? 'ignore case (JavaScript lowercase)' : 'case sensitive'}; ${rules.trimEdges ? 'ignore surrounding whitespace' : 'preserve surrounding whitespace'}. Blank/whitespace-only lines skipped.`,
    `Items: A ${result.totalA}, B ${result.totalB}. Extra occurrences: A ${result.extraA}, B ${result.extraB}.`,
    `View: ${differencesOnly ? 'count differences' : 'all items'}. Lines refer to the pasted input; they do not identify which duplicate is incorrect.`,
    ...selected.map(row => [
      `Item: ${JSON.stringify(row.key)}`,
      `Count A: ${row.a.length}; Count B: ${row.b.length}; A minus B: ${row.delta}`,
      `A input lines: ${row.a.map(x => x.line).join(', ') || 'none'}`,
      `B input lines: ${row.b.map(x => x.line).join(', ') || 'none'}`,
      `Original A values: ${[...new Set(row.a.map(x => x.value))].map(x => JSON.stringify(x)).join(', ') || 'none'}`,
      `Original B values: ${[...new Set(row.b.map(x => x.value))].map(x => JSON.stringify(x)).join(', ') || 'none'}`,
    ].join('\n')),
  ].join('\n\n');
}
