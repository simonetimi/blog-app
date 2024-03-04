'use client';

import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { Accordion, AccordionItem } from '@nextui-org/react';
import axios from 'axios';

import InputField from '../../components/ui/Input';

export default function Profile() {
  // get and save user id
  const [user, setUser] = useState({
    username: '',
    email: '',
    bio: '',
  });
  // fetch user info from database
  useEffect(() => {
    const getUserDetails = async () => {
      const response = await axios.get('/api/users/me');
      setUser(response.data.user);
    };
    getUserDetails();
  }, []);

  const [password, setPassword] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [buttonDisabled, setButtonDisabled] = useState(false);

  // functions to submit the forms
  const onUsernameChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setButtonDisabled(true);
    toast.dismiss();
    toast.loading('Updating username...');
    try {
      const response = await axios.put('/api/users/update', {
        username: user.username,
      });
      if (response.status === 200) {
        toast.dismiss();
        toast.success('Username updated!');
        setUser({ ...user, username: '' });
        setTimeout(() => {
          setButtonDisabled(false);
          toast.dismiss();
          location.reload();
        }, 1000);
      }
    } catch (error) {
      toast.dismiss();
      setButtonDisabled(false);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data.error || 'An error occured. Please try again.';
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const onEmailChange = async (event: React.FormEvent<HTMLFormElement>) => {
    setButtonDisabled(true);
    event.preventDefault();
    toast.dismiss();
    toast.loading('Updating email...');
    try {
      const response = await axios.put('/api/users/update', {
        email: user.email,
      });
      if (response.status === 200) {
        toast.dismiss();
        toast.success('Check your inbox to verify your email!');
        setUser({ ...user, email: '' });
        setTimeout(() => {
          setButtonDisabled(false);
          toast.dismiss();
          location.reload();
        }, 1000);
      }
    } catch (error) {
      toast.dismiss();
      setButtonDisabled(false);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data.error || 'An error occured. Please try again.';
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const onBioChange = async (event: React.FormEvent<HTMLFormElement>) => {
    setButtonDisabled(true);
    event.preventDefault();
    toast.dismiss();
    toast.loading('Logging bio...');
    try {
      const response = await axios.put('/api/users/update', {
        bio: user.bio,
      });
      if (response.status === 200) {
        toast.dismiss();
        toast.success('Bio updated!');
        setUser({ ...user, bio: '' });
        setTimeout(() => {
          setButtonDisabled(false);
          toast.dismiss();
          location.reload();
        }, 1000);
      }
    } catch (error) {
      toast.dismiss();
      if (axios.isAxiosError(error)) {
        setButtonDisabled(false);
        const message =
          error.response?.data.error || 'An error occured. Please try again.';
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const onPasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    setButtonDisabled(true);
    event.preventDefault();
    toast.dismiss();
    toast.loading('Updating password...');
    if (password.newPassword !== password.confirmPassword) {
      setButtonDisabled(false);
      toast.dismiss();
      return toast.error("Passwords don't match!");
    }
    try {
      const response = await axios.put('/api/users/update', {
        password: password.newPassword,
      });
      if (response.status === 200) {
        toast.dismiss();
        toast.success('Password updated!');
        setPassword({ newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setButtonDisabled(false);
          toast.dismiss();
          location.reload();
        }, 1000);
      }
    } catch (error) {
      toast.dismiss();
      if (axios.isAxiosError(error)) {
        setButtonDisabled(false);
        const message =
          error.response?.data.error || 'An error occured. Please try again.';
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  // functions to handle the inputs
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

  const handleOnChangeBio = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const target = event.target as HTMLTextAreaElement;
    setUser({
      ...user,
      bio: target.value,
    });
  };

  const handleOnChangePassword = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPassword({
      ...password,
      newPassword: event.target.value,
    });
  };

  const handleOnChangeConfirmPassword = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPassword({
      ...password,
      confirmPassword: event.target.value,
    });
  };

  return (
    <>
      <Toaster />
      <h1 className="mb-10 p-4 text-2xl">Edit your account info</h1>
      <Accordion
        variant="light"
        className="w-4/6 max-w-[350px] lg:w-2/6"
        itemClasses={{ title: 'text-white' }}
      >
        <AccordionItem
          key="username"
          aria-label="Username"
          title="Username"
          className="text-white opacity-100"
        >
          <form
            className="flex flex-col items-center justify-center gap-6"
            onSubmit={onUsernameChange}
          >
            <label
              className="flex w-full flex-col"
              aria-label="username"
              htmlFor="username"
            >
              <InputField
                id="username"
                type="text"
                min={3}
                max={32}
                value={user.username}
                placeholder="Your new username"
                onChange={handleOnChangeUsername}
                required={true}
              />
            </label>
            <button
              className="flex h-9 w-20 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white hover:bg-white hover:text-black active:translate-y-1"
              type="submit"
              disabled={buttonDisabled}
            >
              Edit
            </button>
          </form>
        </AccordionItem>
        <AccordionItem key="email" aria-label="Edit email" title="Edit email">
          <form
            className="flex flex-col items-center justify-center gap-6"
            onSubmit={onEmailChange}
          >
            <label
              className="flex w-full flex-col"
              aria-label="email"
              htmlFor="email"
            >
              <InputField
                id="email"
                type="text"
                min={4}
                max={254}
                value={user.email}
                placeholder="Your new email"
                onChange={handleOnChangeEmail}
                required={true}
              />
            </label>
            <button
              className="flex h-9 w-20 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white hover:bg-white hover:text-black active:translate-y-1"
              type="submit"
              disabled={buttonDisabled}
            >
              Edit
            </button>
          </form>
        </AccordionItem>
        <AccordionItem key="bio" aria-label="Edit bio" title="Edit bio">
          <form
            className="flex flex-col items-center justify-center gap-6"
            onSubmit={onBioChange}
          >
            <label
              className="flex w-full flex-col"
              aria-label="bio"
              htmlFor="bio"
            >
              <textarea
                className="h-40 w-4/5 resize-none self-center rounded-md border border-white bg-black p-2 text-sm text-white focus:outline-none"
                id="bio"
                name="bio"
                minLength={1}
                maxLength={320}
                value={user.bio}
                placeholder="Your new bio"
                onChange={handleOnChangeBio}
              />
            </label>
            <button
              className="flex h-9 w-20 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white hover:bg-white hover:text-black active:translate-y-1"
              type="submit"
              disabled={buttonDisabled}
            >
              Edit
            </button>
          </form>
        </AccordionItem>
        <AccordionItem
          key="password"
          aria-label="Edit password"
          title="Edit password"
        >
          <form
            className="flex flex-col items-center justify-center gap-6"
            onSubmit={onPasswordChange}
          >
            <label
              className="flex w-full flex-col"
              aria-label="password"
              htmlFor="password"
            >
              <InputField
                id="password"
                type="password"
                min={6}
                max={256}
                value={password.newPassword}
                placeholder="Your new password"
                onChange={handleOnChangePassword}
                required={true}
              />
            </label>
            <label
              className="flex w-full flex-col"
              aria-label="confirm password"
              htmlFor="confirmPassword"
            >
              <InputField
                id="confirmPassword"
                type="password"
                min={6}
                max={256}
                value={password.confirmPassword}
                placeholder="Confirm your new password"
                onChange={handleOnChangeConfirmPassword}
                required={true}
              />
            </label>
            <button
              className="flex h-9 w-20 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white hover:bg-white hover:text-black active:translate-y-1"
              type="submit"
              disabled={buttonDisabled}
            >
              Edit
            </button>
          </form>
        </AccordionItem>
      </Accordion>
    </>
  );
}
