import { jwtVerify } from 'jose';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';

import UserMenu from './components/ui/UserMenu';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Inkwell Insights - Blog App',
  description: 'Fullstack Blog App project',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // retrieve username from session
  const cookieStore = cookies();
  const session = cookieStore.get('session')?.value || '';
  const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);
  let username = '';
  try {
    const { payload } = await jwtVerify(session, secret);
    if (typeof payload !== 'string' && 'username' in payload) {
      username = payload.username as string;
    }
  } catch (error) {}

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="flex">
          <h1>Inkwell Insights - Blog</h1>
          <UserMenu username={username} />
        </header>
        {children}
      </body>
    </html>
  );
}
