import type { Metadata } from 'next';
import './globals.css';
import './image-tools.css';
export const metadata: Metadata = {
  title: 'PDF Line Break Review — HWANSEEK',
  description: 'A free tool to review and selectively join line breaks in copied PDF text. Keep paragraphs, compare the original, and copy the result.',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to tool</a>{children}</body></html>;
}
