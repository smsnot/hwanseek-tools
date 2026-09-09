import type { Metadata } from 'next';
import Review from './review';
export const metadata: Metadata = { title: 'Subtitle Pair Review — HWANSEEK', description: 'Match subtitle filenames to video names, review episode candidates and output collisions, and download confirmed renamed copies in a ZIP. Free local browser tool.' };
export default function Page() { return <Review />; }
