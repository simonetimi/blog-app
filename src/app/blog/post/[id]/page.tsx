'use client';

import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  Accordion,
  AccordionItem,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CircularProgress,
  Divider,
} from '@nextui-org/react';
import axios from 'axios';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import SendComment from '@/app/components/SendComment';
import NotFound from '@/app/components/ui/NotFound';

interface Params {
  params: {
    id: string;
  };
}

export default function PostPage({ params }: Params) {
  const router = useRouter();
  const [isSession, setIsSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState({
    id: params.id,
    title: '',
    content: '',
    publishDate: new Date(),
    author: '',
    isDraft: false,
    comments: [
      {
        author: { _id: '', username: '' },
        content: '',
        publishDate: new Date(),
        _id: '',
      },
    ],
  });
  const [user, setUser] = useState({
    username: '',
    role: '',
  });
  const [error, setError] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    async function getPostDetails() {
      try {
        const response = await axios.post('/api/posts/get', {
          postId: params.id,
        });
        if (!response.data.post) {
          setIsLoading(false);
          return setError(true);
        }
        setPost((currentPost) => ({
          ...currentPost,
          title: response.data.post.title,
          content: response.data.post.content,
          publishDate: response.data.post.publishDate,
          author: response.data.post.author.username,
          isDraft: response.data.post.isDraft,
          comments: response.data.post.comments,
        }));
        setIsSession(response.data.isSession);
        setUser((currentUser) => ({
          ...currentUser,
          username: response.data.username,
          role: response.data.role,
        }));
        setIsLoading(false);
        setError(false);
      } catch (error) {
        return setError(true);
      }
    }
    getPostDetails();
  }, [params.id, user.username]);

  // functions to control edit and delete post
  const handleOnPostDelete = async () => {
    toast.dismiss();
    setButtonDisabled(true);
    toast.loading('Deleting post...');
    try {
      const response = await axios.post('/api/posts/delete', {
        postId: params.id,
      });
      toast.dismiss();
      if (response.status === 200) {
        toast.success('Post deleted!');
        setTimeout(() => {
          toast.dismiss();
          router.push('/blog/');
        }, 1000);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      setButtonDisabled(false);
    } catch (error) {
      setButtonDisabled(false);
      toast.dismiss();
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data.error || 'An error occurred. Please try again.';
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };
  const handleOnPostEdit = () => {
    router.push(`/blog/post/edit/${params.id}`);
  };

  // functions to control delete comment
  const handleOnCommentDelete = async (commentId: string) => {
    toast.dismiss();
    setButtonDisabled(true);
    toast.loading('Deleting comment...');
    try {
      const response = await axios.post('/api/comments/delete', {
        postId: params.id,
        commentId: commentId,
      });
      toast.dismiss();
      if (response.status === 200) {
        toast.success('Comment deleted!');
        setTimeout(() => {
          toast.dismiss();
          location.reload();
        }, 1000);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      setButtonDisabled(false);
    } catch (error) {
      setButtonDisabled(false);
      toast.dismiss();
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data.error || 'An error occurred. Please try again.';
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  if (error) {
    return (
      <NotFound
        errorMessage={`The post you were searching for does not exist!`}
        redirectUrl={'/blog/'}
      />
    );
  }

  return isLoading ? (
    <CircularProgress className="mt-4" aria-label="Loading..." />
  ) : (
    <Card className="z-1 w-full border border-white bg-black text-white lg:w-4/6">
      <Toaster />
      <CardHeader className="flex items-start">
        <h1 className="text-2xl">{post.title}</h1>
        {post.isDraft ? <p className="ml-auto text-red-600">Draft</p> : <></>}
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
            className={`text-slate-500 transition-transform-colors hover:text-slate-300`}
          >
            {' '}
            {post.author}
          </Link>
        </p>
      </section>
      {(user.role === 'admin' && user.username !== 'Guest') ||
      user.username === post.author ? (
        <section className="flex justify-end gap-2">
          <button
            onClick={handleOnPostEdit}
            className="w-22 flex h-8 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white transition-transform-colors hover:bg-white hover:text-black active:translate-y-1"
            type="button"
            disabled={buttonDisabled}
          >
            <PencilIcon className="h-7 w-7 items-center pr-2" /> Edit
          </button>
          <button
            onClick={handleOnPostDelete}
            className="w-22 mb-2 mr-2 flex h-8 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white transition-transform-colors hover:bg-red-600 active:translate-y-1"
            type="button"
            disabled={buttonDisabled}
          >
            <TrashIcon className="h-7 w-7 items-center pr-2" /> Delete
          </button>
        </section>
      ) : (
        <></>
      )}
      <Divider className="bg-gray-700" />
      <CardFooter className="flex w-full">
        <Accordion className="w-full" itemClasses={{ title: 'text-white' }}>
          <AccordionItem
            key="addComment"
            aria-label="Add Comment"
            title="Add Comment"
            className="text-white opacity-100"
          >
            {isSession ? (
              <SendComment postId={params.id} />
            ) : (
              <p className="text-center">
                You must be be logged in to comment the post.
              </p>
            )}
          </AccordionItem>
          <AccordionItem
            key="showComments"
            aria-label="Show Comments"
            title="Show Comments"
            className="text-white opacity-100"
          >
            {isSession ? (
              post.comments.length < 1 ? (
                <p className="text-center">
                  No comments yet? Be the trailblazer!
                </p>
              ) : (
                <section className="flex flex-col gap-4">
                  {post.comments.map((comment) => (
                    <Card
                      className="bg-back border border-gray-700 text-white"
                      key={comment._id}
                    >
                      <CardHeader>
                        <Link
                          className={`text-slate-500 transition-transform-colors hover:text-slate-300`}
                          href={`/blog/user/${comment.author.username}`}
                        >
                          {comment.author.username}
                        </Link>
                      </CardHeader>
                      <CardBody>
                        <p>{comment.content}</p>
                      </CardBody>
                      <Divider className="flex bg-gray-700" />
                      <CardFooter>
                        <p className="text-sm">
                          {format(comment.publishDate, 'MMMM dd, yyyy')}
                        </p>
                        {(user.role === 'admin' && user.username !== 'Guest') ||
                        user.username === comment.author.username ? (
                          <button
                            className="w-22 ml-auto flex h-8 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white transition-transform-colors hover:bg-red-600 active:translate-y-1"
                            type="button"
                            disabled={buttonDisabled}
                            onClick={() => handleOnCommentDelete(comment._id)}
                          >
                            <TrashIcon className="h-7 w-7 items-center pr-2" />{' '}
                            Delete
                          </button>
                        ) : (
                          <></>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </section>
              )
            ) : (
              <p className="text-center">
                You must be logged in to see the comments.
              </p>
            )}
          </AccordionItem>
        </Accordion>
      </CardFooter>
    </Card>
  );
}
