import { toggleLike }
from "../../api/posts.api";

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

  const handleLike = async () => {

    if (!isAuthenticated || !token) {
      alert("Silakan login");

      return;
    }

    await toggleLike(
      post.id,
      token
    );

    onRefresh?.();
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">

      <div className="flex items-center gap-3 mb-3">

        <div className="w-10 h-10 rounded-full bg-gray-300" />

        <div>
          <h3 className="font-bold">
            {post.author.name}
          </h3>

          <p className="text-sm text-gray-500">
            {new Date(
              post.createdAt
            ).toLocaleString()}
          </p>
        </div>

      </div>

      <p className="mb-3">
        {post.content}
      </p>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="post"
          className="rounded-lg mb-3"
        />
      )}

      <div className="flex gap-4 text-sm text-gray-600 mb-3">

        <p>
          ❤️ {post.likeCount}
        </p>

        <p>
          💬 {post.commentCount}
        </p>

      </div>

      <button
        onClick={handleLike}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Like
      </button>

    </div>
  );
}