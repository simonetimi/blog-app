'use client';

import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import InputField from '../../components/ui/Input';

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const onSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.dismiss();
    if (user.password !== confirmPassword) {
      setButtonDisabled(false);
      return toast.error("Passwords don't match!");
    }
    setButtonDisabled(true);
    const loadingToast = toast.loading('Signing up...');
    try {
      const response = await axios.post('/api/users/signup', user);
      toast.dismiss(loadingToast);
      if (response.status === 200) {
        const successToast = toast.success('Signed up! Check your email');
        setTimeout(() => {
          toast.dismiss(successToast);
          router.push('/login');
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
        const nicerMessage = `${message.charAt(0).toUpperCase()}${message.slice(1)}`;
        toast.error(nicerMessage);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleOnChangeUsername = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setUser({
      ...user,
      username: event.target.value,
    });
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

  const handleOnChangeConfirmPassword = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(event.target.value);
  };

  return (
    <main className=" flex h-screen flex-col items-center justify-center">
      <Toaster />
      <h1 className="mb-10 p-4 text-2xl">Signup Page</h1>
      <form
        className="flex flex-col items-center justify-center gap-6"
        onSubmit={onSignUp}
      >
        <label className="flex flex-col" htmlFor="username">
          Username:
          <InputField
            id="username"
            type="text"
            min={3}
            max={32}
            value={user.username}
            placeholder="Your username"
            onChange={handleOnChangeUsername}
            required={true}
          />
        </label>
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
        <label className="flex flex-col" htmlFor="confirmPassword">
          Confirm password:
          <InputField
            id="confirmPassword"
            type="password"
            min={6}
            max={256}
            value={confirmPassword}
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
          Signup
        </button>
      </form>
      <Link className="mt-5 rounded-md p-1 text-xs underline" href="/login">
        Already have an account? Go to login
      </Link>
    </main>
  );
}
