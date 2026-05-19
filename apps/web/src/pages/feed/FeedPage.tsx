import { useEffect, useState }
from "react";

import { getPosts }
from "../../api/posts.api";

import PostCard
from "../../components/post/PostCard";

import PostForm
from "../../components/post/PostForm";

import { useAuthStore }
from "../../stores/auth.store";

export default function FeedPage() {

  const [posts, setPosts] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const {
    token,
    isAuthenticated
  } = useAuthStore();

  const fetchPosts = async () => {

    try {
      setLoading(true);

      const result =
        await getPosts();

      setPosts(result.data);

    } catch (err) {

      setError(
        "Gagal memuat feed"
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 text-gray-900">

      <PostForm
        token={token ?? undefined}
        isAuthenticated={
          isAuthenticated
        }
        onSuccess={fetchPosts}
      />

      {posts.length === 0 ? (

        <p>
          Belum ada postingan
        </p>

      ) : (

        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            token={token ?? undefined}
            isAuthenticated={
              isAuthenticated
            }
            onRefresh={fetchPosts}
          />
        ))

      )}

    </div>
  );
}
