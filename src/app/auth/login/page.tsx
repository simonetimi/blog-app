'use client';

import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import InputField from '../../components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const onLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.dismiss();
    setButtonDisabled(true);
    const loadingToast = toast.loading('Logging in...');
    try {
      const response = await axios.post('/api/users/login', user);
      toast.dismiss(loadingToast);
      if (response.status === 200) {
        const successToast = toast.success('Login successful!');
        setTimeout(() => {
          toast.dismiss(successToast);
          router.refresh();
        }, 1000);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      setButtonDisabled(false);
    } catch (error) {
      setButtonDisabled(false);
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

  const handleOnChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      email: event.target.value,
    });
  };

  const handleOnChangePassword = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setUser({
      ...user,
      password: event.target.value,
    });
  };

  return (
    <main className=" flex h-screen flex-col items-center justify-center">
      <Toaster />
      <h1 className="mb-10 p-4 text-2xl">Login Page</h1>
      <form
        className="flex flex-col items-center justify-center gap-6"
        onSubmit={onLogin}
      >
        <div></div>
        <label className="flex flex-col" htmlFor="email">
          Email:
          <InputField
            id="email"
            type="email"
            min={4}
            max={254}
            value={user.email}
            placeholder="Your email"
            onChange={handleOnChangeEmail}
            required={true}
          />
        </label>
        <label className="flex flex-col" htmlFor="password">
          Password:
          <InputField
            id="password"
            type="password"
            min={6}
            max={256}
            value={user.password}
            placeholder="Your password"
            onChange={handleOnChangePassword}
            required={true}
          />
        </label>
        <button
          className="flex h-9 w-20 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white hover:bg-white hover:text-black active:translate-y-1"
          type="submit"
          disabled={buttonDisabled}
        >
          Login
        </button>
      </form>
      <section className="mt-8 flex flex-col items-center gap-2">
        <Link className="rounded-md p-1 text-xs underline" href="/auth/signup">
          New user? Sign up here
        </Link>
        <Link
          className="rounded-md p-1 text-xs underline"
          href="/auth/request-password-reset"
        >
          Reset your password
        </Link>
      </section>
    </main>
  );
}
