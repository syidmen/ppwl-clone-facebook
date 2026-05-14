import type { CommentItem, FeedPost, NotificationItem, PublicUser } from "@ppwl/shared";
import { LIMITS } from "@ppwl/shared";
import { GoogleLogin } from "@react-oauth/google";
import { Bell, Home, Image, LogOut, MessageCircle, RefreshCw, Send, Settings, ThumbsUp, UserRound } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import { api } from "./api";
import { useAuthStore } from "./stores/auth.store";
import { useNotificationStore } from "./stores/notification.store";

type View = "home" | "notifications" | "profile";

const demoPosts: FeedPost[] = [
  {
    id: "demo-1",
    text: "Selamat datang di Facebook KW PPWL. Beranda dan detail postingan bisa dilihat publik, tapi aksi sosial tetap butuh login.",
    imageUrl: null,
    author: {
      id: "system",
      name: "PPWL Demo",
      email: "demo@ppwl.local",
      isGoogle: false,
      avatarUrl: null,
      createdAt: new Date().toISOString()
    },
    likeCount: 12,
    commentCount: 3,
    likedByMe: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

// ── App ──────────────────────────────────────────────────────────────────────
export function App() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const { setNotifications, unreadCount } = useNotificationStore();

  const [view, setView] = useState<View>("home");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<(FeedPost & { comments: CommentItem[] }) | null>(null);
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>([]);
  const [message, setMessage] = useState("");

  // Hitung sisa postingan milik user yang sedang login
  const myPostCount = useMemo(() => {
    if (!user) return 0;
    return posts.filter((p) => p.author.id === user.id).length;
  }, [posts, user]);
  const postsLeft = Math.max(0, LIMITS.maxPostsPerUser - myPostCount);

  // Hitung sisa komentar — total semua komentar user di semua post
  const [myTotalComments, setMyTotalComments] = useState(0);
  useEffect(() => {
    if (!user || !selectedPost) return;
    // Hitung dari selectedPost yang sudah di-load (includes comments)
    // Ini perkiraan terbaik tanpa endpoint khusus
    const count = selectedPost.comments.filter((c) => c.author.id === user.id).length;
    setMyTotalComments((prev) => Math.max(prev, count));
  }, [selectedPost, user]);
  const commentsLeft = Math.max(0, LIMITS.maxCommentsPerUser - myTotalComments);

  const visiblePosts = posts.length > 0 ? posts : demoPosts;

  useEffect(() => {
    loadPosts();
  }, [token]);

  useEffect(() => {
    if (user) toast.success(`Selamat datang, ${user.name}`);
  }, [user?.id]);

  async function run(action: () => Promise<void>) {
    try {
      setMessage("");
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  }

  async function loadPosts() {
    await run(async () => {
      setPosts(await api.posts(token));
    });
  }

  async function loadDetail(id: string) {
    await run(async () => {
      setSelectedPost(await api.postDetail(id, token));
    });
  }

  async function loadNotifications() {
    if (!token) return;
    await run(async () => {
      const data = await api.notifications(token);
      setLocalNotifications(data);
      setNotifications(data);
      setView("notifications");
    });
  }

  function requireLogin() {
    setMessage("Silakan login dulu untuk membuat post, like, atau komentar.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Callback setelah auth berhasil (login/register/google)
  function handleAuthSuccess(user: Parameters<typeof setAuth>[0], authToken: string) {
    setAuth(user, authToken);
  }

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-center" />
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-xl font-bold text-white">f</div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-brand-600">Facebook KW PPWL</h1>
          </div>
          <NavButton active={view === "home"} label="Beranda" icon={<Home size={20} />} onClick={() => setView("home")} />
          <NavButton
            active={view === "notifications"}
            label="Notifikasi"
            icon={
              <span className="relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
            }
            onClick={isAuthenticated ? loadNotifications : requireLogin}
          />
          <NavButton active={view === "profile"} label="Profile" icon={<Settings size={20} />} onClick={() => (isAuthenticated ? setView("profile") : requireLogin())} />
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[280px_1fr_300px]">
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <AuthPanel
            isAuthenticated={isAuthenticated}
            user={user}
            token={token}
            onAuth={handleAuthSuccess}
            onLogout={() => {
              logout();
              setView("home");
            }}
          />
          <InfoPanel />
        </aside>

        <section className="min-w-0 space-y-4">
          {message && <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</div>}

          {view === "home" && (
            <>
              <Composer disabled={!isAuthenticated} onBlocked={requireLogin} postsLeft={postsLeft} onCreate={async (text, imageUrl) => {
                if (!token) return requireLogin();
                await run(async () => {
                  await api.createPost(token, { text, imageUrl });
                  await loadPosts();
                });
              }} />
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpen={() => loadDetail(post.id)}
                  onLike={() =>
                    token
                      ? run(async () => {
                          await api.likePost(token, post.id);
                          await loadPosts();
                        })
                      : requireLogin()
                  }
                />
              ))}
            </>
          )}

          {view === "notifications" && (
            <ProtectedRoute>
              <NotificationsList notifications={localNotifications} onRefresh={loadNotifications} />
            </ProtectedRoute>
          )}

          {view === "profile" && isAuthenticated && user && (
            <ProtectedRoute>
              <ProfileForm
                user={user}
                onSave={(body) =>
                  token
                    ? run(async () => {
                        const updated = await api.updateMe(token, body);
                        handleAuthSuccess(updated, token);
                      })
                    : Promise.resolve()
                }
              />
            </ProtectedRoute>
          )}
        </section>

        <aside className="hidden space-y-4 lg:block lg:sticky lg:top-20 lg:self-start">
          <DetailPanel
            post={selectedPost}
            canInteract={isAuthenticated}
            onBlocked={requireLogin}
            commentsLeft={commentsLeft}
            onComment={async (postId, text) => {
              if (!token) return requireLogin();
              await run(async () => {
                await api.comment(token, postId, { text });
                await loadDetail(postId);
                await loadPosts();
              });
            }}
          />
        </aside>
      </main>

      {selectedPost && (
        <div className="lg:hidden">
          <DetailSheet
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            canInteract={isAuthenticated}
            onBlocked={requireLogin}
            commentsLeft={commentsLeft}
            onComment={async (postId, text) => {
              if (!token) return requireLogin();
              await run(async () => {
                await api.comment(token, postId, { text });
                await loadDetail(postId);
                await loadPosts();
              });
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── NavButton ────────────────────────────────────────────────────────────────
function NavButton(props: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={props.onClick} title={props.label} className={`focus-ring flex h-10 w-10 items-center justify-center rounded-md ${props.active ? "bg-brand-50 text-brand-600" : "text-slate-600 hover:bg-slate-100"}`}>
      {props.icon}
    </button>
  );
}

// ── AuthPanel ────────────────────────────────────────────────────────────────
function AuthPanel({
  isAuthenticated,
  user,
  token,
  onAuth,
  onLogout
}: {
  isAuthenticated: boolean;
  user: PublicUser | null;
  token: string | null;
  onAuth: (user: PublicUser, token: string) => void;
  onLogout: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const email = String(form.get("email"));
      const password = String(form.get("password"));
      const result =
        mode === "login"
          ? await api.login({ email, password })
          : await api.register({ name: String(form.get("name")), email, password });
      const { token: authToken, ...userData } = result as PublicUser & { token: string };
      onAuth(userData, authToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auth gagal");
    }
  }

  async function handleGoogleLogin(credentialResponse: { credential?: string }) {
    try {
      const googleToken = credentialResponse.credential;
      if (!googleToken) throw new Error("Token Google tidak ditemukan");
      const result = await api.loginGoogle(googleToken) as PublicUser & { token: string };
      const { token: authToken, ...userData } = result;
      onAuth(userData, authToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login gagal");
    }
  }

  if (isAuthenticated && user) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <Avatar user={user} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <button onClick={onLogout} className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
          <LogOut size={16} /> Logout
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-3 grid grid-cols-2 rounded-md bg-slate-100 p-1 text-sm font-semibold">
        <button type="button" onClick={() => setMode("login")} className={`rounded px-3 py-2 ${mode === "login" ? "bg-white shadow-sm" : ""}`}>Login</button>
        <button type="button" onClick={() => setMode("register")} className={`rounded px-3 py-2 ${mode === "register" ? "bg-white shadow-sm" : ""}`}>Register</button>
      </div>

      <form onSubmit={submit}>
        {mode === "register" && <Input name="name" placeholder="Nama" minLength={2} />}
        <Input name="email" placeholder="Email" type="email" />
        <Input name="password" placeholder="Password" type="password" minLength={mode === "register" ? 8 : 1} />
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <button className="focus-ring mb-3 w-full rounded-md bg-brand-500 px-3 py-2 font-semibold text-white hover:bg-brand-600">
          {mode === "login" ? "Masuk" : "Daftar"}
        </button>
      </form>

      <div className="relative flex items-center gap-2 py-1">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">atau</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="mt-3 flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setError("Google login gagal")}
          text={mode === "register" ? "signup_with" : "signin_with"}
          shape="rectangular"
          width="100%"
        />
      </div>
    </div>
  );
}

// ── Composer ─────────────────────────────────────────────────────────────────
const VIDEO_EXT_RE = /\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v|3gp|ogv)(\?.*)?$/i;
const VIDEO_HOST_RE = /youtu\.?be|vimeo\.com|dailymotion\.com|twitch\.tv/i;

function isVideoUrl(url: string) {
  return VIDEO_EXT_RE.test(url) || VIDEO_HOST_RE.test(url);
}

function Composer({ disabled, onBlocked, onCreate, postsLeft }: { disabled: boolean; onBlocked: () => void; onCreate: (text: string, imageUrl?: string) => void; postsLeft: number }) {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setImageUrl(val);
    if (val && isVideoUrl(val)) {
      setImageError("Video tidak diperbolehkan. Gunakan URL gambar (jpg, png, webp, gif).");
    } else {
      setImageError("");
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return onBlocked();
    if (!text.trim()) return;
    if (imageUrl && isVideoUrl(imageUrl)) {
      setImageError("Video tidak diperbolehkan. Gunakan URL gambar (jpg, png, webp, gif).");
      return;
    }
    onCreate(text, imageUrl || undefined);
    setText("");
    setImageUrl("");
    setImageError("");
  }

  if (!disabled && postsLeft <= 0) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Kamu sudah mencapai batas maksimal <strong>{LIMITS.maxPostsPerUser} postingan</strong>. Tidak bisa membuat postingan baru.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-4">
      {!disabled && (
        <p className="mb-2 text-xs text-slate-500">
          Sisa postingan: <strong className={postsLeft <= 1 ? "text-amber-600" : "text-slate-700"}>{postsLeft}</strong> / {LIMITS.maxPostsPerUser}
        </p>
      )}
      <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={LIMITS.maxPostTextLength} placeholder={disabled ? "Login dulu untuk membuat postingan" : "Apa yang kamu pikirkan?"} disabled={disabled} className="focus-ring min-h-24 w-full resize-none rounded-md border border-slate-200 p-3 disabled:bg-slate-50 disabled:text-slate-400" />
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1">
          <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-slate-600 ${imageError ? "border-red-400 bg-red-50" : "border-slate-200"}`}>
            <Image size={16} />
            <input value={imageUrl} onChange={handleImageChange} placeholder="URL gambar (opsional, bukan video)" className="min-w-0 flex-1 outline-none bg-transparent" disabled={disabled} />
          </div>
          {imageError && <p className="text-xs text-red-600">{imageError}</p>}
        </label>
        <button disabled={disabled || !!imageError} className="focus-ring flex items-center justify-center gap-2 rounded-md bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed">
          <Send size={16} /> Post
        </button>
      </div>
    </form>
  );
}

// ── PostCard ──────────────────────────────────────────────────────────────────
function PostCard({ post, onOpen, onLike }: { post: FeedPost; onOpen: () => void; onLike: () => void }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white">
      <div className="flex items-center gap-3 p-4">
        <Avatar user={post.author} />
        <div>
          <p className="font-semibold">{post.author.name}</p>
          <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString("id-ID")}</p>
        </div>
      </div>
      <button onClick={onOpen} className="block w-full px-4 text-left">
        <p className="whitespace-pre-wrap text-sm leading-6">{post.text}</p>
        {post.imageUrl && <img src={post.imageUrl} alt="" className="mt-3 max-h-[420px] w-full rounded-md object-cover" />}
      </button>
      <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-500">
        <span>{post.likeCount} suka</span>
        <span>{post.commentCount} komentar</span>
      </div>
      <div className="grid grid-cols-2 border-t border-slate-100 p-1">
        <button onClick={onLike} className={`focus-ring flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${post.likedByMe ? "text-brand-600" : "text-slate-600 hover:bg-slate-50"}`}>
          <ThumbsUp size={16} /> Like
        </button>
        <button onClick={onOpen} className="focus-ring flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          <MessageCircle size={16} /> Komentar
        </button>
      </div>
    </article>
  );
}

// ── Detail ────────────────────────────────────────────────────────────────────
function DetailPanel({ post, canInteract, onBlocked, onComment, commentsLeft }: { post: (FeedPost & { comments: CommentItem[] }) | null; canInteract: boolean; onBlocked: () => void; onComment: (postId: string, text: string) => void; commentsLeft?: number }) {
  if (!post) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Pilih postingan untuk melihat detail dan komentar.
      </div>
    );
  }
  return <PostDetail post={post} canInteract={canInteract} onBlocked={onBlocked} onComment={onComment} commentsLeft={commentsLeft} />;
}

function DetailSheet(props: { post: FeedPost & { comments: CommentItem[] }; canInteract: boolean; onBlocked: () => void; onClose: () => void; onComment: (postId: string, text: string) => void; commentsLeft?: number }) {
  return (
    <div className="fixed inset-0 z-30 bg-black/40 p-3">
      <div className="ml-auto h-full max-w-lg overflow-auto rounded-md bg-white p-4">
        <button onClick={props.onClose} className="focus-ring mb-3 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold">Tutup</button>
        <PostDetail {...props} />
      </div>
    </div>
  );
}

function PostDetail({ post, canInteract, onBlocked, onComment, commentsLeft }: { post: FeedPost & { comments: CommentItem[] }; canInteract: boolean; onBlocked: () => void; onComment: (postId: string, text: string) => void; commentsLeft?: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="font-semibold">Detail Postingan</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{post.text}</p>
      {post.imageUrl && <img src={post.imageUrl} alt="" className="mt-3 max-h-[420px] w-full rounded-md object-cover" />}
      <CommentForm commentsLeft={canInteract ? commentsLeft : undefined} onSubmit={(text) => (canInteract ? onComment(post.id, text) : onBlocked())} />
      <div className="mt-4 space-y-3">
        {post.comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}

function CommentCard({ comment }: { comment: CommentItem }) {
  return (
    <div className="border-l-2 border-slate-200 pl-3">
      <div className="rounded-md bg-slate-50 p-3">
        <p className="text-sm font-semibold">{comment.author.name}</p>
        <p className="text-sm">{comment.text}</p>
        <p className="mt-1 text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString("id-ID")}</p>
      </div>
    </div>
  );
}

function CommentForm({ onSubmit, commentsLeft }: { onSubmit: (text: string) => void; commentsLeft?: number }) {
  const [text, setText] = useState("");
  const limitReached = commentsLeft !== undefined && commentsLeft <= 0;
  return (
    <div className="mt-4">
      {commentsLeft !== undefined && (
        <p className="mb-1 text-xs text-slate-500">
          Sisa komentar: <strong className={commentsLeft <= 1 ? "text-amber-600" : "text-slate-700"}>{commentsLeft}</strong> / {LIMITS.maxCommentsPerUser}
        </p>
      )}
      {limitReached ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Kamu sudah mencapai batas maksimal <strong>{LIMITS.maxCommentsPerUser} komentar</strong>.
        </div>
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onSubmit(text);
          setText("");
        }} className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={LIMITS.maxCommentTextLength} placeholder="Tulis komentar" className="focus-ring min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm" />
          <button className="focus-ring rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Kirim</button>
        </form>
      )}
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────
function ProfileForm({ user, onSave }: { user: PublicUser; onSave: (body: { name?: string; email?: string; avatarUrl?: string | null; password?: string }) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    onSave({
      name: String(form.get("name")),
      email: String(form.get("email")),
      avatarUrl: String(form.get("avatarUrl")) || null,
      ...(password ? { password } : {})
    });
  }

  return (
    <form onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="mb-3 font-semibold">Edit Profile</h2>
      <Input name="name" placeholder="Nama" defaultValue={user.name} />
      <Input name="email" placeholder="Email" type="email" defaultValue={user.email} />
      <Input name="avatarUrl" placeholder="URL avatar" defaultValue={user.avatarUrl ?? ""} />
      <Input name="password" placeholder="Password baru" type="password" minLength={8} required={false} />
      <button className="focus-ring rounded-md bg-brand-500 px-4 py-2 font-semibold text-white">Simpan</button>
    </form>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────
function NotificationsList({ notifications, onRefresh }: { notifications: NotificationItem[]; onRefresh: () => void }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-semibold">Notifikasi</h2>
        <button onClick={onRefresh} className="focus-ring flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="space-y-2">
        {notifications.length === 0 && <p className="text-sm text-slate-500">Belum ada notifikasi.</p>}
        {notifications.map((item) => (
          <div key={item.id} className={`rounded-md p-3 text-sm ${item.readAt ? "bg-slate-50" : "bg-brand-50 border border-brand-100"}`}>
            <p>{item.message}</p>
            <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("id-ID")}</p>
            {!item.readAt && (
              <span className="mt-1 inline-block rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white">Baru</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── InfoPanel ──────────────────────────────────────────────────────────────────
function InfoPanel() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
      <p className="font-semibold text-slate-900">Aturan tugas</p>
      <p className="mt-2">Maksimal {LIMITS.maxPostsPerUser} postingan dan {LIMITS.maxCommentsPerUser} komentar per user. Video tidak didukung.</p>
    </div>
  );
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input required {...props} className="focus-ring mb-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />;
}

function Avatar({ user }: { user: PublicUser }) {
  const fallback = useMemo(() => user.name.slice(0, 1).toUpperCase(), [user.name]);
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 font-bold text-slate-600">
      {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : <UserRound size={18} aria-label={fallback} />}
    </div>
  );
}
