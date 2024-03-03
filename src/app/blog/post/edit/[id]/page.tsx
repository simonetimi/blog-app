'use client';

import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { Checkbox } from '@nextui-org/react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import InputField from '@/app/components/ui/Input';

interface Params {
  params: {
    id: string;
  };
}

export default function EditPost({ params }: Params) {
  const router = useRouter();
  const [post, setPost] = useState({
    title: '',
    content: '',
    isDraft: false,
    postId: params.id,
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);

  // handle inputs
  const handleOnChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPost({ ...post, title: event.target.value });
  };
  const handleOnChangeContent = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setPost({ ...post, content: event.target.value });
  };
  const handleDraftCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPost({ ...post, isDraft: event.target.checked });
  };

  // api call to create post
  const onEditPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.dismiss();
    setButtonDisabled(true);
    const loadingToast = toast.loading('Editing post...');
    try {
      const response = await axios.post('/api/posts/edit', post);
      toast.dismiss(loadingToast);
      if (response.status === 200) {
        const successToast = toast.success('Post edited!');
        setTimeout(() => {
          toast.dismiss(successToast);
          router.push(`/blog/post/${params.id}`);
        }, 1000);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      setButtonDisabled(false);
    } catch (error) {
      setButtonDisabled(false);
      toast.dismiss(loadingToast);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data.error || 'An error occurred. Please try again.';
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  useEffect(() => {
    async function getPostDetails() {
      try {
        const response = await axios.post('/api/posts/get', {
          postId: params.id,
          isEdit: true,
        });
        if (!response.data.post) {
        }
        setPost((currentPost) => ({
          ...currentPost,
          title: response.data.post.title,
          content: response.data.post.content,
          isDraft: response.data.post.isDraft,
        }));
      } catch (error) {
        return router.push(`/blog/post/${params.id}`);
      }
    }
    getPostDetails();
  }, [params.id, router]);

  return (
    <>
      <Toaster />
      <h1 className="p-2 text-2xl">Edit Post</h1>
      <form
        className="flex w-screen flex-col items-center justify-center gap-6"
        onSubmit={onEditPost}
      >
        <div></div>
        <label className="flex w-2/5 flex-col" htmlFor="email">
          Title:
          <InputField
            id="title"
            type="title"
            min={2}
            max={60}
            value={post.title}
            placeholder="Title"
            onChange={handleOnChangeTitle}
            required={true}
            width="w-full"
          />
        </label>
        <label className="flex w-2/5 flex-col " htmlFor="post">
          Post:
          <textarea
            className="h-80 resize-none rounded-md border border-white bg-black p-2 text-sm text-white focus:outline-none"
            id="post"
            name="post"
            minLength={4}
            maxLength={5000}
            value={post.content}
            placeholder="Write new post"
            onChange={handleOnChangeContent}
          />
        </label>
        <label className="flex gap-2 text-white" htmlFor="draft">
          Draft
          <Checkbox
            id="draft"
            onChange={handleDraftCheck}
            isSelected={post.isDraft}
          ></Checkbox>
        </label>
        <button
          className="flex h-9 w-20 items-center justify-center rounded-md border border-white bg-black p-4 text-sm text-white hover:bg-white hover:text-black active:translate-y-1"
          type="submit"
          disabled={buttonDisabled}
        >
          Edit
        </button>
      </form>
    </>
  );
}
