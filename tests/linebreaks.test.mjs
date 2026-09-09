import test from 'node:test';
import assert from 'node:assert/strict';
import { splitText, renderText, EXAMPLE } from '../lib/linebreaks.ts';
test('keeps the exact original by default, including CRLF and whitespace', () => {
  for (const text of ['', EXAMPLE, ' a\r\nb\rc\n', 'a\n \nb', '한글\n日本語\n🙂', '<script>alert(1)</script>\n&', '1,200.\n100%']) assert.equal(renderText(splitText(text), {}), text);
});
test('example A joins prose while preserving the blank paragraph', () => {
  assert.equal(renderText(splitText(EXAMPLE), {0:'space',1:'space',2:'space'}), 'Copy text from a PDF without fixing every line.\n\nKeep this paragraph separate.');
});
test('example B permits retaining headings while joining only prose', () => {
  const text='Keep these headings separate\nChapter two\nA normal sentence\ncontinues here.';
  assert.equal(renderText(splitText(text),{2:'space'}), 'Keep these headings separate\nChapter two\nA normal sentence continues here.');
});
test('example C preserves numbers and list items with explicit choices', () => {
  const text='The value is 1,200.\nDo not change it.\n\n- Keep this item\n- And this item';
  assert.equal(renderText(splitText(text),{0:'space'}), 'The value is 1,200. Do not change it.\n\n- Keep this item\n- And this item');
});
test('tight joins retain hyphens, spaces and every non-newline character', () => {
  assert.equal(renderText(splitText('co-\noperate'), {0:'tight'}), 'co-operate');
  assert.equal(renderText(splitText('word \n next'),{0:'space'}), 'word   next');
});
test('protected edges include whitespace-only lines and terminal newlines', () => {
  const text='a\r\n \r\nb\n'; assert.equal(renderText(splitText(text), {0:'tight',1:'space',2:'tight'}),text);
});
test('restoring choices reproduces the complete original after edits', () => {
  const p=splitText(EXAMPLE); renderText(p,{0:'space'}); assert.equal(renderText(p,{}),EXAMPLE);
});
