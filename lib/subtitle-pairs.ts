export function basename(path: string) { return path.split(/[\\/]/).at(-1) || ''; }
export function episodeKey(name: string): string | null {
  const matches = [...name.matchAll(/(?:^|[^a-z0-9])(?:s(\d{1,3})e(\d{1,4})|(\d{1,3})x(\d{1,4}))(?=$|[^a-z0-9]|e\d)/gi)];
  if (matches.length !== 1 || /(?:s\d+e\d+|\d+x\d+)[ ._-]*[eExX+]\d|(?:s\d+e\d+|\d+x\d+)[ ._]*-\d/i.test(name)) return null;
  const m = matches[0]; return `${Number(m[1] ?? m[3])}:${Number(m[2] ?? m[4])}`;
}
export function candidateVideos(subtitle: string, videos: string[]) { const key = episodeKey(subtitle); return key ? videos.map((v, i) => episodeKey(v) === key ? i : -1).filter(i => i >= 0) : []; }
export function subtitleTags(name: string) {
  const tokens = basename(name).replace(/\.[^.]+$/, '').toLowerCase().split(/[^a-z0-9]+/);
  const languages: Record<string, string> = { en: 'en', eng: 'en', english: 'en', fr: 'fr', fre: 'fr', fra: 'fr', french: 'fr', es: 'es', spa: 'es', spanish: 'es', de: 'de', ger: 'de', deu: 'de', german: 'de', ko: 'ko', kor: 'ko', korean: 'ko', ja: 'ja', jpn: 'ja', japanese: 'ja', zh: 'zh', chi: 'zh', zho: 'zh', chinese: 'zh', pt: 'pt', por: 'pt', it: 'it', ita: 'it', ru: 'ru', rus: 'ru', ar: 'ar', ara: 'ar' };
  const found = [...new Set(tokens.filter(t => languages[t]).map(t => languages[t]))];
  return [...(found.length === 1 ? found : []), ...['forced', 'sdh', 'cc'].filter(t => tokens.includes(t))].join('.');
}
export function proposedName(video: string, subtitle: string, tags: string) { return basename(video).replace(/\.[^.]+$/, '') + (tags.trim() ? '.' + tags.trim() : '') + '.' + basename(subtitle).split('.').at(-1)!.toLowerCase(); }
export function filenameError(name: string, extension: string) {
  if (!name || name.length > 220 || /[<>:"/\\|?*\x00-\x1f\x7f]/.test(name) || /[. ]$/.test(name) || name !== name.trim()) return 'Use a filename up to 220 characters with no path, reserved characters, or edge spaces.';
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)) return 'This name is reserved on Windows.';
  if (!name.toLowerCase().endsWith('.' + extension.toLowerCase())) return `Keep the original .${extension} extension.`;
  return '';
}
export function collisionNames(names: string[]) { const counts = new Map<string, number>(); for (const n of names) { const k = n.normalize('NFC').toLowerCase(); counts.set(k, (counts.get(k) || 0) + 1); } return new Set([...counts].filter(([, n]) => n > 1).map(([k]) => k)); }
export const EXAMPLE_VIDEOS = 'Example.Show.S01E01.mkv\nExample.Show.S01E02.mkv\nExample.Show.S01E04.1080p.mkv\nExample.Show.S01E04.2160p.mkv';
