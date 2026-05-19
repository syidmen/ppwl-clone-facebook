import { useState }
from "react";

import { createPost }
from "../../api/posts.api";

interface Props {
  token?: string;
  isAuthenticated?: boolean;
  onSuccess?: () => void;
}

export default function PostForm({
  token,
  isAuthenticated,
  onSuccess
}: Props) {

  const [content, setContent] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      alert("Silakan login");

      return;
    }

    if (imageUrl.includes("mp4")) {
      alert(
        "Video tidak diperbolehkan"
      );

      return;
    }

    await createPost(
      {
        content,
        imageUrl
      },
      token
    );

    setContent("");
    setImageUrl("");

    onSuccess?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow p-4 mb-6"
    >

      <textarea
        placeholder="Apa yang kamu pikirkan?"
        value={content}
        onChange={(e) =>
          setContent(e.target.value)
        }
        className="w-full border rounded-lg p-3 mb-3"
      />

      <input
        type="text"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) =>
          setImageUrl(e.target.value)
        }
        className="w-full border rounded-lg p-3 mb-3"
      />

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Post
      </button>

    </form>
  );
}