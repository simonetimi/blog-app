import Link from 'next/link';

export default function NotFound({
  errorMessage,
  redirectUrl,
}: {
  errorMessage: string;
  redirectUrl: string;
}) {
  return (
    <main className="flex h-96 flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p>{errorMessage}</p>
      <Link
        href={redirectUrl}
        className="w-30 flex h-9 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white hover:bg-white hover:text-black active:translate-y-1"
      >
        Go Back
      </Link>
    </main>
  );
}
