import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import Link from 'next/link';

import UserMenu from '../components/ui/UserMenu';

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
    <>
      <header className="flex h-1/6 items-center p-6 pl-10 pr-10">
        <Link href="/blog">
          <h1 className="text-xl">Inkwell Insights - Blog</h1>
        </Link>
        <UserMenu username={username} />
      </header>
      <main className="mb-10 flex max-h-fit flex-col items-center justify-center gap-3 p-10">
        {children}
      </main>
    </>
  );
}
