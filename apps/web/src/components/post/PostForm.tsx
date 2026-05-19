import { useEffect, useState } from "react";
import { createPost, updatePost, type PostInput } from "../../api/posts.api";

interface Props {
  token?: string;
  isAuthenticated?: boolean;
  post?: any;
  onCancel?: () => void;
  onSuccess?: () => void;
}

function hasVideoUrl(value: string) {
  return /\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(value) || /youtube\.com|youtu\.be|vimeo\.com/i.test(value);
}

export default function PostForm({
  token,
  isAuthenticated,
  post,
  onCancel,
  onSuccess
}: Props) {
  const [content, setContent] = useState(post?.content ?? "");
  const [imageUrl, setImageUrl] = useState(post?.imageUrl ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setContent(post?.content ?? "");
    setImageUrl(post?.imageUrl ?? "");
  }, [post]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isAuthenticated || !token) {
      alert("Silakan login untuk membuat atau mengubah post.");
      return;
    }

    const payload: PostInput = {
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined
    };

    if (!payload.content) {
      alert("Konten post wajib diisi.");
      return;
    }

    if (payload.imageUrl && hasVideoUrl(payload.imageUrl)) {
      alert("Video tidak diperbolehkan. Gunakan URL gambar.");
      return;
    }

    try {
      setLoading(true);

      if (post) {
        await updatePost(post.id, payload, token);
      } else {
        await createPost(payload, token);
        setContent("");
        setImageUrl("");
      }

      onSuccess?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menyimpan post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-xl bg-white p-4 text-gray-900 shadow"
    >
      <textarea
        placeholder="Apa yang kamu pikirkan?"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="mb-3 min-h-24 w-full resize-y rounded-lg border bg-white p-3 text-gray-900 placeholder:text-gray-400"
      />

      <input
        type="text"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(event) => setImageUrl(event.target.value)}
        className="mb-3 w-full rounded-lg border bg-white p-3 text-gray-900 placeholder:text-gray-400"
      />

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : post ? "Simpan" : "Post"}
        </button>
      </div>
    </form>
  );
}
