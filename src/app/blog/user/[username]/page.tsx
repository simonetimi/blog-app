'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

import NotFound from '@/app/components/ui/NotFound';

interface Params {
  params: {
    username: string;
  };
}

export default function UserProfile({ params }: Params) {
  const [user, setUser] = useState({
    username: params.username,
    bio: '',
  });
  const [error, setError] = useState(false);

  // fetch user bio from database
  useEffect(() => {
    async function getUserDetails() {
      try {
        const response = await axios.post('/api/users/profile', {
          username: params.username,
        });
        if (response.status !== 200) {
          return setError(true);
        }
        setUser((currentUser) => ({ ...currentUser, bio: response.data.bio }));
        setError(false);
      } catch (error) {
        setError(true);
      }
    }
    getUserDetails();
  }, [params.username]);

  if (error) {
    return (
      <NotFound
        redirectUrl={'/blog/'}
        errorMessage={`User ${params.username} does not exist!`}
      />
    );
  }

  return (
    <>
      <h1 className="mb-10 p-4 text-2xl">{params.username}&apos;s profile</h1>
      <p>{user.bio ? user.bio : 'Loading...'}</p>
    </>
  );
}
