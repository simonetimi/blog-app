'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowLeftStartOnRectangleIcon,
  CogIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSession, setIsSession] = useState(false);
  useEffect(() => {
    if (username && username !== '') {
      setIsSession(true);
    } else {
      setIsSession(false);
    }
    setIsLoading(false);
  }, [username]);

  if (isLoading) {
    return <div className="w-30 h-10" />;
  }

  if (!isSession) {
    return (
      <Link
        href="/auth/login"
        className="w-30 ml-auto flex h-9 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white hover:bg-white hover:text-black active:translate-y-1"
      >
        Login
      </Link>
    );
  }

  // use router.push() with scroll: false to avoid a browser warning due to the sticky behavior of the header
  // handler for navigating to "My account"
  const handleMyAccountClick = () => {
    router.push(`/blog/user/${username}`, { scroll: false });
  };

  // handler for navigating to "Profile"
  const handleProfileClick = () => {
    router.push('/blog/user/', { scroll: false });
  };

  return (
    <nav className="ml-auto">
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Avatar
            as="button"
            showFallback
            className="transition-transform"
            name={username}
            src=""
          />
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Profile Actions"
          className="text-slate-900"
          disabledKeys={['preview']}
        >
          <DropdownItem
            key="preview"
            textValue="Signed in"
            className="opacity-100"
          >
            <p className="font-semibold">Signed in as {username}</p>
          </DropdownItem>
          <DropdownSection aria-label="Manage Account" showDivider>
            <DropdownItem key="profile" onClick={handleMyAccountClick}>
              <div className="flex items-center">
                <UserCircleIcon className="mr-1 h-6 w-6" />
                <p>Profile</p>
              </div>
            </DropdownItem>
            <DropdownItem key="account" onClick={handleProfileClick}>
              <div className="flex items-center">
                <CogIcon className="mr-1 h-6 w-6" />
                <p>My Account</p>
              </div>
            </DropdownItem>
          </DropdownSection>
          <DropdownSection aria-label="Danger Zone">
            <DropdownItem key="logout" color="danger" onClick={onLogout}>
              <div className="flex items-center">
                <ArrowLeftStartOnRectangleIcon className="mr-1 h-6 w-6" />
                <p>Log Out</p>
              </div>
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </nav>
  );
}
