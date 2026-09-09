import type { Metadata } from 'next';
import Review from './review';
export const metadata: Metadata = { title: 'PDF Highlight Review — HWANSEEK', description: 'Find exact-text locations for embedded PDF highlights in a revised PDF. Review each location and download a highlighted copy. Free local browser tool for simple text PDFs.' };
export default function Page() { return <Review />; }
