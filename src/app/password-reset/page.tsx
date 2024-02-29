'use client';

import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import InputField from '../components/ui/Input';

export default function PasswordResetPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [userInput, setUserInput] = useState({
    password: '',
    confirmPassword: '',
  });
  const [resetted, setResetted] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const onChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setButtonDisabled(true);
    toast.dismiss();

    // check if passwords match
    if (userInput.password !== userInput.confirmPassword) {
      setButtonDisabled(false);
      return toast.error("Passwords don't match!");
    }

    // check if token is empty
    if (token.length < 1) {
      setButtonDisabled(false);
      return toast.error('Invalid token! Request a new link');
    }

    const loadingToast = toast.loading('Setting new password...');
    try {
      await axios.post('/api/users/password-reset', {
        token: token,
        password: userInput.password,
      });
      setResetted(true);
      toast.dismiss(loadingToast);
      const successToast = toast.success('Password changed!');
      setTimeout(() => {
        toast.dismiss(successToast);
        router.push('/login');
      }, 5000);
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

  const handleOnChangePassword = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setUserInput({ ...userInput, password: event.target.value });
  };

  const handleOnChangeConfirmPassword = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setUserInput({ ...userInput, confirmPassword: event.target.value });
  };

  // grab the token from the URL param at component load
  useEffect(() => {
    const urlToken = window.location.search.split('=')[1];
    setToken(urlToken || '');
  }, []);

  return (
    <main className=" flex h-screen flex-col items-center justify-center">
      <Toaster />
      <h1 className="mb-10 p-4 text-2xl">
        {resetted
          ? 'Congratulations, your new password has been set!'
          : 'Set your new password'}
      </h1>
      {resetted ? (
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
      ) : (
        <form
          className="flex flex-col items-center justify-center gap-6"
          onSubmit={onChangePassword}
        >
          <label className="flex flex-col" htmlFor="password">
            Password:
            <InputField
              id="password"
              type="password"
              min={6}
              max={256}
              value={userInput.password}
              placeholder="Your password"
              onChange={handleOnChangePassword}
              required={true}
            />
          </label>
          <label className="flex flex-col" htmlFor="confirmPassword">
            Confirm password:
            <InputField
              id="confirmPassword"
              type="password"
              min={6}
              max={256}
              value={userInput.confirmPassword}
              placeholder="Your password"
              onChange={handleOnChangeConfirmPassword}
              required={true}
            />
          </label>
          <button
            className="flex h-9 w-20 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white hover:bg-white hover:text-black active:translate-y-1"
            type="submit"
            disabled={buttonDisabled}
          >
            Confirm
          </button>
        </form>
      )}
    </main>
  );
}
