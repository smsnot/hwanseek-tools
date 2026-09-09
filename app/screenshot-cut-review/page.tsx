import type { Metadata } from 'next';
import Review from './review';
export const metadata: Metadata = { title: 'Screenshot Cut Review — HWANSEEK', description: 'Remove several middle sections from a screenshot. Review every cut against the original and save a PNG with visible omission markers. Free browser tool.' };
export default function Page() { return <Review />; }
