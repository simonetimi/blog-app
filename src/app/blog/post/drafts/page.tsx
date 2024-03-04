'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, Pagination } from '@nextui-org/react';
import axios from 'axios';
import { format } from 'date-fns';
import Link from 'next/link';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEmpty, setIsEmpty] = useState(false);
  const [posts, setPosts] = useState([
    {
      title: '',
      author: { _id: '', username: '' },
      publishDate: new Date(),
      _id: '',
    },
  ]);

  useEffect(() => {
    async function getAllDrafts() {
      try {
        const response = await axios.post('/api/posts/get-drafts', {
          currentPage: currentPage,
        });
        if (response.data.posts.length < 1) {
          return setIsEmpty(true);
        }
        setPosts(response.data.posts);
        setTotalPages(response.data.totalPages);
        setIsEmpty(false);
      } catch (error) {
        return setIsEmpty(true);
      }
    }
    getAllDrafts();
  }, [currentPage]);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isEmpty) {
    return (
      <main className="flex h-96 flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">No drafts found!</h2>
      </main>
    );
  }

  return (
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
  );
}
