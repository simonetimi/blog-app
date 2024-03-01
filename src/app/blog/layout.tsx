import { NewspaperIcon } from '@heroicons/react/24/outline';
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
      <header className="sticky top-0 z-10 flex items-center border-b-1 border-gray-800 bg-gradient-to-b from-gray-800/70 to-transparent p-6 px-10 backdrop-blur-md">
        <Link href="/blog" className="flex gap-2">
          <NewspaperIcon className="h-10 w-10 items-center" />
          <h1 className="font-recursive text-3xl">Inkwell Insights</h1>
        </Link>
        <UserMenu username={username} />
      </header>
      <main className="mb-10 flex max-h-fit flex-col items-center justify-center gap-3 p-10">
        {children}
      </main>
    </>
  );
}
