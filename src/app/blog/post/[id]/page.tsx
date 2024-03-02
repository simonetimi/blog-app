'use client';

import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionItem,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
} from '@nextui-org/react';
import axios from 'axios';
import { format } from 'date-fns';
import Link from 'next/link';

import SendComment from '@/app/components/SendComment';
import NotFound from '@/app/components/ui/NotFound';

interface Params {
  params: {
    id: string;
  };
}

export default function PostPage({ params }: Params) {
  const [post, setPost] = useState({
    id: params.id,
    title: '',
    content: '',
    publishDate: new Date(),
    author: '',
    isDraft: false,
    comments: [],
  });
  const [error, setError] = useState(false);

  // fetch user bio from database
  useEffect(() => {
    async function getPostDetails() {
      try {
        const response = await axios.post('/api/posts/get', {
          postId: params.id,
        });
        setPost((currentPost) => ({
          ...currentPost,
          title: response.data.post.title,
          content: response.data.post.content,
          publishDate: response.data.post.publishDate,
          author: response.data.post.author.username,
          isDraft: response.data.post.isDraft,
          comments: response.data.post.comments,
        }));
        setError(false);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data.error;
          console.log(message);
          return setError(true);
        } else if (error instanceof Error) {
          console.log(error.message);
          return setError(true);
        }
      }
    }
    getPostDetails();
  }, [params.id]);

  if (error) {
    return (
      <NotFound
        errorMessage={`The post you were searching for does not exist!`}
        redirectUrl={'/blog/'}
      />
    );
  }

  return (
    <Card className="z-1 w-3/6 border border-white bg-black text-white">
      <CardHeader className="flex flex-col items-start">
        <h1 className="text-2xl">{post.title}</h1>
      </CardHeader>
      <CardBody>
        <p>{post.content}</p>
      </CardBody>
      <section className="flex gap-2">
        <p className="self-start p-4 text-small">
          {format(post.publishDate, 'MMMM dd, yyyy')}
        </p>
        <p className="ml-auto p-4 text-medium">
          By
          <Link
            href={`/blog/user/${post.author}`}
            className="transition-transform-colors hover:text-teal-800"
          >
            {' '}
            {post.author}
          </Link>
        </p>
      </section>
      <Divider className="bg-gray-700" />
      <CardFooter className="flex w-full">
        <Accordion className="w-full" itemClasses={{ title: 'text-white' }}>
          <AccordionItem
            key="addComment"
            aria-label="Add Comment"
            title="Add Comment"
            className="text-white opacity-100"
          >
            <SendComment postId={params.id} />
          </AccordionItem>
          <AccordionItem
            key="showComments"
            aria-label="Show Comments"
            title="Show Comments"
            className="text-white opacity-100"
          >
            {post.comments.length < 1
              ? 'No comments yet? Be the trailblazer!'
              : 'WRITE CODE TO RENDER COMMENTS'}
          </AccordionItem>
          {
            // Add here field to post comment if COOKIE session exists. otherwise nothing
          }
        </Accordion>
      </CardFooter>
    </Card>
  );
}
