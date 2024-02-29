'use client';

import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import InputField from '../../components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const onRequestPasswordReset = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    toast.dismiss();
    setButtonDisabled(true);
    const loadingToast = toast.loading('Requesting...');
    try {
      const response = await axios.post('api/users/request-password-reset', {
        email: email,
      });
      toast.dismiss(loadingToast);
      if (response.status === 200) {
        const successToast = toast.success(response.data.message);
        setTimeout(() => {
          toast.dismiss(successToast);
          router.push(`/login`);
        }, 1500);
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
    setEmail(event.target.value);
  };

  return (
    <main className=" flex h-screen flex-col items-center justify-center">
      <Toaster />
      <h1 className="mb-10 p-4 text-2xl">Password reset</h1>
      <form
        className="flex flex-col items-center justify-center gap-6"
        onSubmit={onRequestPasswordReset}
      >
        <div></div>
        <label className="flex flex-col" htmlFor="email">
          Email:
          <InputField
            id="email"
            type="email"
            min={4}
            max={254}
            value={email}
            placeholder="Your email"
            onChange={handleOnChangeEmail}
            required={true}
          />
        </label>
        <button
          className="flex h-9 w-20 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white hover:bg-white hover:text-black active:translate-y-1"
          type="submit"
          disabled={buttonDisabled}
        >
          Send
        </button>
      </form>
    </main>
  );
}
