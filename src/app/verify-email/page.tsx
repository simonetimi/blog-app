'use client';

import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [verified, setVerified] = useState(false);

  const verifyEmail = async () => {
    const loadingToast = toast.loading('Verifying email...');
    try {
      await axios.post('/api/users/verify-email', { token });
      setVerified(true);
      toast.dismiss(loadingToast);
      const successToast = toast.success('Email verified!');
      setTimeout(() => {
        toast.dismiss(successToast);
        router.push('/login');
      }, 5000);
    } catch (error) {
      toast.dismiss(loadingToast);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data.error || 'An error occurred. Please try again.';
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  // grab the token from the URL param at component load
  useEffect(() => {
    const urlToken = window.location.search.split('=')[1];
    setToken(urlToken || '');
  }, []);

  // call verifyEmail when component loads or when token changes
  useEffect(() => {
    if (token.length > 0) {
      verifyEmail();
    }
  }, [token]);

  return (
    <main className=" flex h-screen flex-col items-center justify-center">
      <Toaster />
      <h1 className="mb-10 p-4 text-2xl">
        {verified
          ? 'Congratulations, we verified your email!'
          : 'Verifying your email...'}
      </h1>
      {verified && (
        <>
          <p>You&apos;re being redirected...</p>
          <p>
            Click&nbsp;
            <Link className="underline" href="/login">
              here
            </Link>
            &nbsp;if you&apos;re not being redirected automatically.
          </p>
        </>
      )}
    </main>
  );
}
