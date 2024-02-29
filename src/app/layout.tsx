import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Inkwell Insights - Blog App',
  description: 'Fullstack Blog App project',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header>
          <h1>Inkwell Insights - Blog</h1>
          <nav></nav>
        </header>
        {children}
      </body>
    </html>
  );
}
