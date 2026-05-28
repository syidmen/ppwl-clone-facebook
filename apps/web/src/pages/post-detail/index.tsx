import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getComments, getCommentsByPostId, createComment } from "../../api/comments.api";
import { getPostById } from "../../api/posts.api";
import { useAuthStore } from "../../stores/auth.store";
import { CommentItem } from "../../components/comment/CommentItem";
import defaultProfile from "../../assets/icons/default-profile.png";
import noCommentIcon from "../../assets/icons/no-comment.png";
import sendActiveIcon from "../../assets/icons/kirim-active.png";
import sendInactiveIcon from "../../assets/icons/kirim-unactive.png";

const COLLAPSED_TEXT_LENGTH = 80;

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M19.884 5.884a1.25 1.25 0 0 0-1.768-1.768L12 10.232 5.884 4.116a1.25 1.25 0 1 0-1.768 1.768L10.232 12l-6.116 6.116a1.25 1.25 0 0 0 1.768 1.768L12 13.768l6.116 6.116a1.25 1.25 0 0 0 1.768-1.768L13.768 12l6.116-6.116z"
        fill="currentColor"
      />
    </svg>
  );
}

function PaperPlaneIcon({ active }: { active: boolean }) {
  return (
    <img
      src={active ? sendActiveIcon : sendInactiveIcon}
      alt=""
      className="h-[22px] w-[22px] object-contain"
    />
  );
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const shouldCollapse = text.length > COLLAPSED_TEXT_LENGTH;
  const visibleText =
    shouldCollapse && !expanded
      ? `${text.slice(0, COLLAPSED_TEXT_LENGTH).trimEnd()}...`
      : text;

  return (
    <p className="m-0 whitespace-pre-wrap text-[15px] leading-6 text-gray-900">
      {visibleText}
      {shouldCollapse && !expanded && (
        <>
          {" "}
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="font-semibold text-gray-900 hover:underline"
          >
            Lihat selengkapnya
          </button>
        </>
      )}
      {shouldCollapse && expanded && (
        <>
          {" "}
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="font-semibold text-gray-900 hover:underline"
          >
            Tampilkan lebih sedikit
          </button>
        </>
      )}
    </p>
  );
}

function CommentSkeleton() {
  return (
    <div className="mb-4 flex gap-2">
      <div className="fb-skeleton h-9 w-9 shrink-0 rounded-full" />
      <div className="flex-1">
        <div className="rounded-2xl bg-[#f0f2f5] px-3 py-3">
          <div className="fb-skeleton h-3 w-24 rounded-full" />
          <div className="fb-skeleton mt-3 h-3 w-56 max-w-full rounded-full" />
          <div className="fb-skeleton mt-2 h-3 w-40 max-w-full rounded-full" />
        </div>
        <div className="fb-skeleton ml-3 mt-2 h-2.5 w-20 rounded-full" />
      </div>
    </div>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-0 sm:px-4">
      <section className="flex h-full w-full flex-col overflow-hidden bg-white text-gray-900 shadow-2xl sm:h-[88vh] sm:max-w-[700px] sm:rounded-xl">
        <header className="relative flex h-[60px] shrink-0 items-center justify-center border-b border-gray-200 px-14" />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <article className="border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="fb-skeleton h-[38px] w-[38px] shrink-0 rounded-full" />
              <div className="flex-1">
                <div className="fb-skeleton h-4 w-40 rounded-full" />
                <div className="fb-skeleton mt-2 h-3 w-32 rounded-full" />
              </div>
            </div>
            <div className="px-4 pb-4">
              <div className="fb-skeleton h-3 w-full rounded-full" />
              <div className="fb-skeleton mt-2 h-3 w-4/5 rounded-full" />
            </div>
            <div className="fb-image-skeleton h-[340px] w-full" />
          </article>
          <div className="px-4 py-4">
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyCommentsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <img src={noCommentIcon} alt="" className="h-24 w-24 object-contain" />
      <div className="mt-5 text-[22px] font-bold leading-tight text-gray-600">
        Belum ada komentar
      </div>
      <div className="mt-2 text-[17px] leading-6 text-gray-600">
        Jadilah yang pertama mengomentari.
      </div>
    </div>
  );
}

export const PostDetailPage = () => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [postId, setPostId] = useState("");
  const [post, setPost] = useState<any | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  const closeModal = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const resolvePostId = async () => {
    const queryPostId = new URLSearchParams(window.location.search).get("postId");
    if (queryPostId) return queryPostId;

    const latestComments = await getComments();
    return latestComments[0]?.postId ?? "";
  };

  const fetchComments = async (targetPostId: string) => {
    try {
      setLoading(true);
      const data = await getCommentsByPostId(targetPostId);
      setComments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const resolvedPostId = await resolvePostId();

        if (!resolvedPostId) {
          setError("Belum ada post/komentar untuk dites.");
          return;
        }

        setPostId(resolvedPostId);
        const postResult = await getPostById(resolvedPostId);
        setPost(postResult.data);
        await fetchComments(resolvedPostId);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newComment.trim() || !postId) return;

    try {
      await createComment(postId, newComment);
      setNewComment("");
      fetchComments(postId);
    } catch (err: any) {
      alert(err.message || "Gagal mengirim komentar. (Maksimal 5 komentar)");
    }
  };

  const renderCommentInput = () => (
    <footer className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
      {isAuthenticated ? (
        <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
          <img
            src={user?.avatarUrl || defaultProfile}
            alt={user?.name || "Profil"}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />

          <div className="flex flex-1 items-center gap-2 rounded-3xl bg-[#f0f2f5] px-4 py-2">
            <input
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Tulis Komentar..."
              className="min-w-0 flex-1 bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-full disabled:cursor-default"
              aria-label="Kirim komentar"
            >
              <PaperPlaneIcon active={Boolean(newComment.trim())} />
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border bg-gray-50 p-3 text-center text-sm">
          Silakan{" "}
          <a href="/login" className="font-bold text-blue-600 hover:underline">
            Log In
          </a>{" "}
          untuk memberikan komentar.
        </div>
      )}
    </footer>
  );

  if (loading && !post) {
    return <PostDetailSkeleton />;
  }

  if (isImageViewerOpen && post?.imageUrl) {
    return (
      <div className="fixed inset-0 z-50 flex overflow-hidden bg-black text-gray-900">
        <div className="relative hidden flex-1 items-center justify-center bg-black md:flex">
          <button
            type="button"
            onClick={() => setIsImageViewerOpen(false)}
            className="absolute left-5 top-4 z-10 flex h-[35.99px] w-[35.99px] items-center justify-center rounded-full bg-white/90 text-gray-900 hover:bg-white"
            aria-label="Tutup detail gambar"
          >
            <CloseIcon />
          </button>
          <img
            src={post.imageUrl}
            alt="post"
            className="h-full w-full object-contain"
          />
        </div>

        <aside className="flex h-full w-full flex-col bg-white md:w-[430px]">
          <div className="flex max-h-[45vh] shrink-0 items-center justify-center bg-black md:hidden">
            <img
              src={post.imageUrl}
              alt="post"
              className="max-h-[45vh] w-full object-contain"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-4">
            <button
              type="button"
              onClick={() => setIsImageViewerOpen(false)}
              className="mr-1 flex h-[35.99px] w-[35.99px] items-center justify-center rounded-full bg-gray-200 text-gray-900 hover:bg-gray-300 md:hidden"
              aria-label="Tutup detail gambar"
            >
              <CloseIcon />
            </button>
            <img
              src={post.author?.avatarUrl || defaultProfile}
              alt={post.author?.name || "Profil"}
              className="h-[38px] w-[38px] shrink-0 rounded-full object-cover"
            />
            <div>
              <p className="text-[15px] font-extrabold">{post.author?.name ?? "Postingan"}</p>
              <p className="text-xs font-semibold text-gray-500">
                {post.createdAt ? new Date(post.createdAt).toLocaleString("id-ID") : ""}
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4">
            <ExpandableText text={post.content} />

            <div className="mt-5 border-t border-gray-200 pt-4">
              {loading && (
                <>
                  <CommentSkeleton />
                  <CommentSkeleton />
                </>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
              {!loading && !error && comments.length === 0 && <EmptyCommentsPlaceholder />}
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </div>

          {renderCommentInput()}
        </aside>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-0 sm:px-4">
      <section className="flex h-full w-full flex-col overflow-hidden bg-white text-gray-900 shadow-2xl sm:h-[88vh] sm:max-w-[700px] sm:rounded-xl">
        <header className="relative flex h-[60px] shrink-0 items-center justify-center border-b border-gray-200 px-14">
          <button
            type="button"
            onClick={closeModal}
            className="absolute right-4 flex h-[35.99px] w-[35.99px] items-center justify-center rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300"
            aria-label="Tutup komentar"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {post && (
            <article className="border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3 px-4 py-3">
                <img
                  src={post.author?.avatarUrl || defaultProfile}
                  alt={post.author?.name || "Profil"}
                  className="h-[38px] w-[38px] shrink-0 rounded-full object-cover"
                />
                <div>
                  <p className="text-[15px] font-bold">{post.author?.name ?? "Postingan"}</p>
                  <p className="text-xs text-gray-500">
                    {post.createdAt ? new Date(post.createdAt).toLocaleString("id-ID") : ""}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4">
                <ExpandableText text={post.content} />
              </div>

              {post.imageUrl && (
                <button
                  type="button"
                  onClick={() => setIsImageViewerOpen(true)}
                  className="block w-full cursor-pointer border-0 bg-transparent p-0"
                  aria-label="Buka detail gambar"
                >
                  <img
                    src={post.imageUrl}
                    alt="post"
                    className="max-h-[460px] w-full object-cover"
                  />
                </button>
              )}
            </article>
          )}

          <div className="px-4 py-3">
            {loading && (
              <>
                <CommentSkeleton />
                <CommentSkeleton />
                <CommentSkeleton />
              </>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {!loading && !error && comments.length === 0 && <EmptyCommentsPlaceholder />}

            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </div>

        {renderCommentInput()}
      </section>
    </div>
  );
};
