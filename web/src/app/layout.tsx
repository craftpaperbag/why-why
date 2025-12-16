import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Why-Why Analysis',
  description: 'AI-powered Why-Why Analysis Tool',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased text-slate-900 bg-slate-50">
        {children}
      </body>
    </html>
  );
}
