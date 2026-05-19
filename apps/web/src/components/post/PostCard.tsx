import { useState } from "react";
import { Link } from "react-router-dom";
import { deletePost, toggleLike } from "../../api/posts.api";
import { useAuthStore } from "../../stores/auth.store";
import PostForm from "./PostForm";

interface Props {
  post: any;
  token?: string;
  isAuthenticated?: boolean;
  onRefresh?: () => void;
}

export default function PostCard({
  post,
  token,
  isAuthenticated,
  onRefresh
}: Props) {
  const user = useAuthStore((state) => state.user);
  const [editing, setEditing] = useState(false);
  const isOwner = user?.id === post.author.id;

  const handleLike = async () => {
    if (!isAuthenticated || !token) {
      alert("Silakan login untuk like.");
      return;
    }

    try {
      await toggleLike(post.id, token);
      onRefresh?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal memproses like.");
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    if (!confirm("Hapus post ini?")) return;

    try {
      await deletePost(post.id, token);
      onRefresh?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menghapus post.");
    }
  };

  if (editing) {
    return (
      <PostForm
        post={post}
        token={token}
        isAuthenticated={isAuthenticated}
        onCancel={() => setEditing(false)}
        onSuccess={() => {
          setEditing(false);
          onRefresh?.();
        }}
      />
    );
  }

  return (
    <div className="mb-4 rounded-xl bg-white p-4 text-gray-900 shadow">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 font-bold text-gray-600">
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              post.author.name?.charAt(0)?.toUpperCase() ?? "U"
            )}
          </div>

          <div>
            <h3 className="font-bold text-gray-900">{post.author.name}</h3>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600"
            >
              Hapus
            </button>
          </div>
        )}
      </div>

      <p className="mb-3 whitespace-pre-wrap text-gray-900">{post.content}</p>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="post"
          className="mb-3 max-h-[480px] w-full rounded-lg object-cover"
        />
      )}

      <div className="mb-3 flex gap-4 text-sm text-gray-600">
        <p>{post.likeCount} suka</p>
        <Link to={`/post-detail?postId=${post.id}`} className="hover:underline">
          {post.commentCount} komentar
        </Link>
      </div>

      <button
        onClick={handleLike}
        className="rounded-lg bg-blue-500 px-4 py-2 text-white"
      >
        Like
      </button>
    </div>
  );
}
