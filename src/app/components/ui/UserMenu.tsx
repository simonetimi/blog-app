'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from '@nextui-org/react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserMenu({ username }: { username: string }) {
  const router = useRouter();

  // handle logout
  const onLogout = async () => {
    toast.dismiss();
    toast.loading('Logging out...');
    try {
      const response = await axios.get('/api/users/logout');
      if (response.status === 200) {
        toast.dismiss();
        toast.success('Logged out!');
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data.error || 'An error occured. Please try again.';
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  // handle render depending on the presence of a session in the cookie
  const [isSession, setIsSession] = useState(false);
  useEffect(() => {
    if (username && username !== '') {
      setIsSession(true);
    } else {
      setIsSession(false);
    }
  }, [username]);

  if (!isSession) {
    return (
      <Link
        href="/auth/login"
        className="w-30 flex h-9 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white hover:bg-white hover:text-black active:translate-y-1"
      />
    );
  }

  return (
    <nav className="ml-auto">
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Avatar
            showFallback
            className="hover:cursor-pointer"
            name={username}
            src=""
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" className="text-slate-900">
          <DropdownSection aria-label="Profile preview" showDivider>
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as {username}</p>
            </DropdownItem>
          </DropdownSection>
          <DropdownSection aria-label="Manage Account" showDivider>
            <DropdownItem key="myAccount" href={`/blog/user/${username}`}>
              My account
            </DropdownItem>
            <DropdownItem key="profile" href="/blog/user/">
              Profile
            </DropdownItem>
          </DropdownSection>
          <DropdownSection aria-label="Danger Zone">
            <DropdownItem key="logout" color="danger" onClick={onLogout}>
              Log Out
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </nav>
  );
}
