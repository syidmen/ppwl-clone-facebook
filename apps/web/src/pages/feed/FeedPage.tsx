import { useEffect, useState } from "react";
import { createPost, deletePost, getPosts, updatePost, uploadPostImage } from "../../api/posts.api";
import PostForm from "../../components/post/PostForm";
import PostCard from "../../components/post/PostCard";
import { useAuthStore } from "../../stores/auth.store";
import photoIcon from "../../assets/icons/photo.webp";
import defaultProfile from "../../assets/icons/default-profile.png";

export type Author = {
  name: string;
  avatar: string;
};

export type CommentType = {
  id: number;
  author: Author;
  text: string;
  time: string;
};

export type PostType = {
  id: string;
  author: Author;
  time: string;
  privacy: string;
  text?: string;
  image?: string;
  likes: number;
  commentCount?: number;
  comments: CommentType[];
};

const INITIAL_POSTS: PostType[] = [];

function formatRelativeTime(value?: string) {
  if (!value) return "Baru saja";

  const created = new Date(value).getTime();
  const diffMs = Date.now() - created;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (Number.isNaN(created)) return "Baru saja";
  if (diffMs < minute) return "Baru saja";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} menit`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} jam`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)} hari`;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function mapApiPost(post: any): PostType {
  const imageUrl = typeof post.imageUrl === "string" && !post.imageUrl.startsWith("blob:")
    ? post.imageUrl
    : undefined;

  return {
    id: post.id,
    author: {
      name: post.author?.name ?? "User",
      avatar: post.author?.avatarUrl || defaultProfile
    },
    time: formatRelativeTime(post.createdAt),
    privacy: "public",
    text: post.content,
    image: imageUrl,
    likes: post.likeCount ?? 0,
    commentCount: post.commentCount ?? 0,
    comments: []
  };
}

function FeedSkeletonCard({ withImage = true }: { withImage?: boolean }) {
  return (
    <article className="mb-4 overflow-hidden rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.16)]">
      <div className="flex items-center gap-3">
        <div className="fb-skeleton h-12 w-12 rounded-full" />
        <div className="flex-1">
          <div className="fb-skeleton h-4 w-28 rounded-full" />
          <div className="fb-skeleton mt-2 h-3 w-36 rounded-full" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="fb-skeleton h-3 w-full rounded-full" />
        <div className="fb-skeleton h-3 w-4/5 rounded-full" />
      </div>
      {withImage && <div className="fb-skeleton mt-5 h-[260px] rounded-md" />}
      <div className="mt-5 flex justify-around">
        <div className="fb-skeleton h-3 w-20 rounded-full" />
        <div className="fb-skeleton h-3 w-20 rounded-full" />
        <div className="fb-skeleton h-3 w-20 rounded-full" />
      </div>
    </article>
  );
}

function DeleteToast({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed bottom-5 left-5 z-[60] flex w-[min(396px,calc(100vw-40px))] items-center gap-4 rounded-md bg-[#242526] px-5 py-4 text-white shadow-[0_6px_18px_rgba(0,0,0,0.28)]">
      <div className="flex-1 text-[15px] leading-5">
        Postingan Anda telah dihapus
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="Tutup notifikasi"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M19.884 5.884a1.25 1.25 0 0 0-1.768-1.768L12 10.232 5.884 4.116a1.25 1.25 0 1 0-1.768 1.768L10.232 12l-6.116 6.116a1.25 1.25 0 0 0 1.768 1.768L12 13.768l6.116 6.116a1.25 1.25 0 0 0 1.768-1.768L13.768 12l6.116-6.116z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
}

export default function FeedPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [posts, setPosts] = useState<PostType[]>(INITIAL_POSTS);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const { user, token, isAuthenticated } = useAuthStore();

  const currentUser: Author | null = user
    ? {
        name: user.name,
        avatar:
          user.avatarUrl ??
          defaultProfile
      }
    : null;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const result = await getPosts();
        setPosts(result.data.map(mapApiPost));
      } catch {
        setPosts(INITIAL_POSTS);
      } finally {
        setIsFeedLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = async (postText: string, imageFile: File | null) => {
    if (!token || !currentUser) {
      alert("Silakan login terlebih dahulu untuk membuat postingan.");
      setIsFormOpen(false);
      return;
    }

    const image = imageFile ? await uploadPostImage(imageFile, token) : undefined;
    const result = await createPost({ content: postText, imageUrl: image }, token);

    const newPost = mapApiPost(result.data);
    const displayPost: PostType = {
      ...newPost,
      author: currentUser,
      image: image ?? newPost.image,
      comments: []
    };

    setPosts((currentPosts) => [displayPost, ...currentPosts]);
    setIsFormOpen(false);
  };

  const handleUpdatePost = async (id: string, newText: string, image?: string, imageFile?: File | null) => {
    if (!token) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    const nextImage = imageFile ? await uploadPostImage(imageFile, token) : image;

    await updatePost(id, { content: newText, imageUrl: nextImage ?? "" }, token);
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === id ? { ...post, text: newText, image: nextImage } : post
      )
    );
  };

  const handleDeletePost = async (id: string) => {
    if (!token) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    await deletePost(id, token);
    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== id));
    setShowDeleteToast(true);
  };

  useEffect(() => {
    if (!showDeleteToast) return;

    const timer = window.setTimeout(() => setShowDeleteToast(false), 5200);
    return () => window.clearTimeout(timer);
  }, [showDeleteToast]);

  const handleOpenPostForm = () => {
    if (!isAuthenticated || !currentUser) {
      alert("Silakan login terlebih dahulu untuk membuat postingan.");
      return;
    }

    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#050505]">
      <div className="mx-auto w-full max-w-[600px] px-3 py-4 sm:px-0">
        <div className="mb-4 rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-3">
            {currentUser ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-[38px] w-[38px] rounded-full object-cover"
              />
            ) : (
              <img
                src={defaultProfile}
                alt="Profil"
                className="h-[38px] w-[38px] rounded-full object-cover"
              />
            )}
            <button
              type="button"
              onClick={handleOpenPostForm}
              className="flex-1 rounded-full bg-[#f0f2f5] px-4 py-2 text-left text-[15px] font-medium text-[#65676b] hover:bg-[#e4e6eb]"
            >
              {currentUser
                ? `Apa yang Anda pikirkan, ${currentUser.name.split(" ")[0]}?`
                : "Login untuk membuat postingan"}
            </button>
            <button
              type="button"
              onClick={handleOpenPostForm}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-[#f0f2f5]"
              aria-label="Tambah foto"
            >
              <img src={photoIcon} alt="" className="h-6 w-6 object-contain" />
            </button>
          </div>
        </div>

        {isFeedLoading ? (
          <>
            <FeedSkeletonCard withImage={false} />
            <FeedSkeletonCard />
            <FeedSkeletonCard />
          </>
        ) : (
          posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onEditPost={handleUpdatePost}
                onDeletePost={handleDeletePost}
              />
            ))
          ) : (
            <div className="rounded-lg bg-white px-4 py-8 text-center text-sm text-[#65676b] shadow-[0_1px_2px_rgba(0,0,0,0.16)]">
              Belum ada postingan.
            </div>
          )
        )}
      </div>

      {isFormOpen && currentUser && (
        <PostForm
          currentUser={currentUser}
          onClose={() => setIsFormOpen(false)}
          onSavePost={handleCreatePost}
        />
      )}

      {showDeleteToast && <DeleteToast onClose={() => setShowDeleteToast(false)} />}
    </div>
  );
}
