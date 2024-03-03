'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@nextui-org/react';
import axios from 'axios';
import { format } from 'date-fns';
import Link from 'next/link';

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
    posts: [{ _id: '', title: '', publishDate: new Date() }],
    comments: [{ _id: '', content: '', publishDate: new Date() }],
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
        setUser((currentUser) => ({
          ...currentUser,
          bio: response.data.userData.bio,
          posts: response.data.userData.posts,
          comments: response.data.userData.comments,
        }));
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
        redirectUrl={'/blog'}
        errorMessage={`User ${params.username} does not exist!`}
      />
    );
  }

  return (
    <>
      <h1 className="mb-6 p-4 text-2xl">{params.username}&apos;s profile</h1>
      <p className="lg:max-w-4/6 max-w-[500px] text-center">{user.bio}</p>
      <section className="flex w-screen flex-col items-center justify-center gap-2">
        {user.posts && user.posts.length > 0 && (
          <>
            <h2 className="mt-4 p-4 text-2xl">Last posts</h2>
            {user.posts.map((post) => (
              <Card
                key={post._id}
                className="z-1 w-5/6 border border-white bg-black text-white lg:w-2/5"
              >
                <CardHeader className="flex items-start">
                  <h3 className="text-color text-lg transition-colors hover:text-slate-600">
                    <Link href={`/blog/post/${post._id}`}>{post.title}</Link>
                  </h3>
                </CardHeader>
                <section className="flex gap-2">
                  <p className="self-start p-4 text-small">
                    {format(new Date(post.publishDate), 'MMMM dd, yyyy')}
                  </p>
                </section>
              </Card>
            ))}
          </>
        )}
        {user.comments && user.comments.length > 0 && (
          <>
            <h2 className="mt-4 gap-2 p-4 text-2xl">Last comments</h2>
            {user.comments.map((comment) => (
              <Card
                key={comment._id}
                className="z-1 w-5/6 border border-white bg-black text-white lg:w-2/5"
              >
                <CardHeader className="flex items-start">
                  <h3 className="text-base">{comment.content}</h3>
                </CardHeader>
                <section className="flex gap-2">
                  <p className="self-start p-4 text-small">
                    {format(new Date(comment.publishDate), 'MMMM dd, yyyy')}
                  </p>
                </section>
              </Card>
            ))}
          </>
        )}
      </section>
    </>
  );
}
