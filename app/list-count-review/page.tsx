import type { Metadata } from 'next';
import ListCountReview from './review';
export const metadata: Metadata = {
  title: 'List Count Review — Compare Duplicates | HWANSEEK',
  description: 'Compare two pasted lists by occurrence count. See extra duplicates, original input line numbers, and optional case or whitespace matching. Free, local browser tool.',
};
export default function Page() { return <ListCountReview />; }
