import type { Metadata } from 'next';
import { Inter, Recursive } from 'next/font/google';

import { Providers } from './providers';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const recursive = Recursive({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-recursive',
});

export const metadata: Metadata = {
  title: 'Inkwell Insights - Blog App',
  description: 'Fullstack Blog App project',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${recursive.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
