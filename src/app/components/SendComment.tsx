'use client';

import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

export default function SendComment({ postId }: { postId: string }) {
  const [comment, setComment] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const onSendComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.dismiss();
    if (comment.length < 3) {
      return toast.error('Comment must be at least 3 characters long');
    }
    try {
      setButtonDisabled(true);
      toast.loading('Sending comment...');
      const response = await axios.post('/api/comments/new', {
        comment: comment,
        postId: postId,
      });
      if (response.status === 200) {
        toast.dismiss();
        toast.success('Your comment has been posted!');
        setTimeout(() => {
          toast.dismiss();
          setButtonDisabled(false);
          setComment('');
          // window.location will reload the page without caching like router.push would
          window.location.href = `/blog/post/${postId}`;
        }, 1500);
      }
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

  const handleOnChangeComment = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setComment(event.target.value);
  };

  return (
    <>
      <Toaster />
      <form
        className="flex flex-col items-center justify-center gap-6"
        onSubmit={onSendComment}
        method="post"
      >
        <label className="flex flex-col" htmlFor="comment">
          Your comment:
          <textarea
            className="h-40 w-96 resize-none rounded-md border border-white bg-black p-2 text-sm text-white focus:outline-none"
            id="comment"
            name="comment"
            minLength={3}
            maxLength={500}
            value={comment}
            placeholder="Write your comment"
            onChange={handleOnChangeComment}
            required
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
    </>
  );
}
