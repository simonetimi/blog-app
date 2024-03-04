'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CircularProgress,
  Pagination,
} from '@nextui-org/react';
import axios from 'axios';
import { format } from 'date-fns';
import Link from 'next/link';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([
    {
      title: '',
      author: { _id: '', username: '' },
      publishDate: new Date(),
      _id: '',
    },
  ]);

  useEffect(() => {
    async function getAllPosts() {
      try {
        const response = await axios.post('/api/posts/get-multiple', {
          currentPage: currentPage,
        });
        if (response.data.posts.length < 1) {
          setIsLoading(false);
          return setIsEmpty(true);
        }
        setPosts(response.data.posts);
        setTotalPages(response.data.totalPages);
        setIsLoading(false);
        setIsEmpty(false);
      } catch (error) {
        return setIsEmpty(true);
      }
    }
    getAllPosts();
  }, [currentPage]);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isEmpty) {
    return (
      <main className="flex h-96 flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Exciting content coming soon!</h2>
        <p className="w-2/3">
          We are currently in the process of crafting engaging and informative
          content that will spark curiosity, provide value, and entertain.
          Whether you&apos;re looking for inspiration, advice, or the latest
          news, our upcoming posts will cover a wide range of topics designed to
          cater to diverse interests.
        </p>
      </main>
    );
  }

  return (
    <>
      {isLoading ? (
        <CircularProgress className="mt-4" aria-label="Loading..." />
      ) : (
        <>
          {posts.map((post) => (
            <Card
              key={post._id}
              className="z-1 ml-2 mr-2 w-full border border-white bg-black text-white lg:w-4/6"
            >
              <CardHeader className="flex items-start">
                <h1 className="text-2xl">
                  <Link href={`/blog/post/${post._id}`}>{post.title}</Link>
                </h1>
              </CardHeader>
              <section className="flex gap-2">
                <p className="self-start p-4 text-small">
                  {format(post.publishDate, 'MMMM dd, yyyy')}
                </p>
                <p className="ml-auto p-4 text-medium">
                  By
                  <Link
                    href={`/blog/user/${post.author.username}`}
                    className={`text-slate-500 transition-transform-colors hover:text-slate-300`}
                  >
                    {' '}
                    {post.author.username}
                  </Link>
                </p>
              </section>
            </Card>
          ))}
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Pagination
              total={totalPages}
              page={1}
              variant="flat"
              className="text-white dark"
              onChange={onPageChange}
            ></Pagination>
          </div>
        </>
      )}
    </>
  );
}
