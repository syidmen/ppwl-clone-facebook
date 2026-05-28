import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Author, CommentType, PostType } from "../../pages/feed/FeedPage";
import { createComment, getCommentsByPostId } from "../../api/comments.api";
import { toggleLike } from "../../api/posts.api";
import { useAuthStore } from "../../stores/auth.store";
import likeIcon from "../../assets/icons/likes.webp";
import defaultProfile from "../../assets/icons/default-profile.png";
import photoIcon from "../../assets/icons/photo.webp";
import noCommentIcon from "../../assets/icons/no-comment.png";
import sendActiveIcon from "../../assets/icons/kirim-active.png";
import sendInactiveIcon from "../../assets/icons/kirim-unactive.png";
import likeActiveIcon from "../../assets/icons/likes-active.png";
import facebookIcon from "../../assets/icons/facebook.svg";

const COLLAPSED_TEXT_LENGTH = 80;
const FACEBOOK_SPRITE_URL =
  "https://static.xx.fbcdn.net/rsrc.php/yp/r/twpm7Tz4xLN.webp?_nc_eui2=AeFKu87uUTIS5DCkQzxB6mIgrwmeb3wupdevCZ5vfC6l1xWNHPco06tgQEXrjEJpO5MY5ssoWvsjGg6X999lYsH_";

type PostCardProps = {
  post: PostType;
  currentUser: Author | null;
  onEditPost?: (id: string, newText: string, image?: string) => Promise<void> | void;
  onDeletePost?: (id: string) => Promise<void> | void;
};

function formatCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(".", ",")} rb`;
  return String(value);
}

function formatLikeSummary(value: number, liked: boolean) {
  if (!liked) return formatCount(value);
  if (value <= 1) return "Anda";
  return `Anda dan ${formatCount(value - 1)} lainnya`;
}

function mapApiComment(comment: any): CommentType {
  const author = comment.author ?? comment.user;

  return {
    id: Number(comment.id ?? Date.now()),
    author: {
      name: author?.name ?? "Pengguna",
      avatar: author?.avatarUrl ?? author?.avatar ?? defaultProfile
    },
    text: comment.content ?? comment.text ?? "",
    time: comment.createdAt
      ? new Date(comment.createdAt).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        })
      : comment.time ?? "Baru saja"
  };
}

function IconThumb({ active = false }: { active?: boolean }) {
  if (active) {
    return <img src={likeActiveIcon} alt="" className="h-5 w-5 object-contain" />;
  }

  return (
    <span
      aria-hidden="true"
      className="opacity-70"
      style={{
        backgroundImage: `url("${FACEBOOK_SPRITE_URL}")`,
        backgroundPosition: "0px -441px",
        backgroundSize: "auto",
        width: 20,
        height: 20,
        backgroundRepeat: "no-repeat",
        display: "inline-block"
      }}
    />
  );
}

function IconComment({
  variant = "fill",
  className = ""
}: {
  variant?: "fill" | "outline";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={className ? `opacity-70 ${className}` : "inline-block opacity-70"}
      style={{
        backgroundImage: `url("${FACEBOOK_SPRITE_URL}")`,
        backgroundPosition: variant === "outline" ? "0px -231px" : "0px -762px",
        backgroundSize: "auto",
        width: variant === "outline" ? 20 : 16,
        height: variant === "outline" ? 20 : 16,
        backgroundRepeat: "no-repeat"
      }}
    />
  );
}

function CommentCountLabel({ count }: { count: number }) {
  return (
    <>
      <span>{formatCount(count)}</span>
      <IconComment variant="fill" className="inline-block sm:hidden" />
      <span className="hidden sm:inline">komentar</span>
    </>
  );
}

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

function FullscreenIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        d={
          active
            ? "M13 5.586V3a1 1 0 1 0-2 0v4a2 2 0 0 0 2 2h4a1 1 0 1 0 0-2h-2.586l3.293-3.293a1 1 0 0 0-1.414-1.414L13 5.586zM8 18a1 1 0 0 1-1-1v-2.586l-3.293 3.293a1 1 0 1 1-1.414-1.414L5.585 13H3a1 1 0 1 1 0-2h4a2 2 0 0 1 2 2v4a1 1 0 0 1-1 1z"
            : "M16 5.414V8a1 1 0 1 0 2 0V4a2 2 0 0 0-2-2h-4a1 1 0 1 0 0 2h2.586l-3.293 3.293a1 1 0 0 0 1.414 1.414L16 5.414zM3 11a1 1 0 0 1 1 1v2.586l3.293-3.293a1 1 0 0 1 1.414 1.414L5.414 16H8a1 1 0 1 1 0 2H4a2 2 0 0 1-2-2v-4a1 1 0 0 1 1-1z"
        }
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <circle cx="4.5" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="15.5" cy="10" r="1.5" />
    </svg>
  );
}

function EditPostIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M16.841 2.028a2.25 2.25 0 0 0-3.182 0L2.513 13.174A1.75 1.75 0 0 0 2 14.41v2.336c0 .69.56 1.25 1.25 1.25h2.336a1.75 1.75 0 0 0 1.237-.512L17.97 6.34a2.25 2.25 0 0 0 0-3.182l-1.13-1.13zm-3.156 2.096 1.035-1.035a.75.75 0 0 1 1.06 0l1.129 1.128a.75.75 0 0 1 0 1.061l-1.035 1.035-2.19-2.19z" />
    </svg>
  );
}

function DeletePostIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6.5 2.75A2.25 2.25 0 0 1 8.75.5h2.5a2.25 2.25 0 0 1 2.25 2.25v.75h4.75a.75.75 0 0 1 0 1.5H17.2l-.634 9.197c-.073 1.06-.133 1.928-.271 2.613-.144.716-.392 1.331-.91 1.816-.52.484-1.151.689-1.876.784-.691.09-1.562.09-2.625.09H9.116c-1.063 0-1.933 0-2.625-.09-.725-.095-1.356-.3-1.875-.784-.52-.485-.767-1.1-.911-1.817-.138-.684-.198-1.552-.27-2.612L2.8 5H1.75a.75.75 0 0 1 0-1.5H6.5v-.75zM8 3.5h4v-.75a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v.75z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="94 401 16 16" fill="currentColor" aria-hidden="true">
      <path d="M104.107 415.696A7.498 7.498 0 0 1 94.5 408.5a7.48 7.48 0 0 1 3.407-6.283 5.474 5.474 0 0 0-1.653 2.334c-.753 2.217-.217 4.075 2.29 4.075.833 0 1.4.561 1.333 2.375-.013.403.52 1.78 2.45 1.89.7.04 1.184 1.053 1.33 1.74.06.29.127.65.257.97a.174.174 0 0 0 .193.096" />
      <path d="M109.5 408.5c0 3.23-2.04 5.983-4.903 7.036l.07-.036c1.167-1 1.814-2.967 2-3.834.214-1 .303-1.3-.5-1.96-.31-.253-.677-.196-1.04-.476-.246-.19-.356-.59-.606-.73-.594-.337-1.107.11-1.954.223a2.666 2.666 0 0 1-1.15-.123c-.007 0-.007 0-.013-.004l-.083-.03c-.164-.082-.077-.206.006-.36h-.006c.086-.17.086-.376-.05-.529-.19-.214-.54-.214-.804-.224-.106-.003-.21 0-.313.004l-.003-.004c-.04 0-.084.004-.124.004h-.037c-.323.007-.666-.034-.893-.314-.263-.353-.29-.733.097-1.09.28-.26.863-.8 1.807-.22.603.37 1.166.667 1.666.5.33-.11.48-.303.094-.87a1.128 1.128 0 0 1-.214-.73c.067-.776.687-.84 1.164-1.2.466-.356.68-.943.546-1.457-.106-.413-.51-.873-1.28-1.01a7.49 7.49 0 0 1 6.524 7.434" />
    </svg>
  );
}

function LikeBadge() {
  return <img src={likeIcon} alt="" className="h-[18px] w-[18px] rounded-full object-contain" />;
}

function PaperPlaneIcon({ active }: { active: boolean }) {
  return (
    <img
      src={active ? sendActiveIcon : sendInactiveIcon}
      alt=""
      className="h-[18px] w-[18px] object-contain"
    />
  );
}

function PrivacyMeta({ time, privacy }: { time: string; privacy: string }) {
  return (
    <div className="mt-[2px] flex items-center gap-1 text-[13px] font-semibold text-[#65676b]">
      <span>{time}</span>
      <span>·</span>
      {privacy === "public" ? <GlobeIcon /> : <span>Teman</span>}
    </div>
  );
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const shouldCollapse = text.length > COLLAPSED_TEXT_LENGTH;
  const shownText = !shouldCollapse || expanded ? text : `${text.slice(0, COLLAPSED_TEXT_LENGTH)}...`;

  return (
    <p className="whitespace-pre-wrap break-words text-[15px] leading-5 text-[#050505]">
      {shownText}
      {shouldCollapse && (
        <>
          {" "}
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="font-semibold text-[#050505] hover:underline"
          >
            {expanded ? "Tampilkan lebih sedikit" : "Lihat selengkapnya"}
          </button>
        </>
      )}
    </p>
  );
}

function EmptyCommentsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <img src={noCommentIcon} alt="" className="mb-5 h-[108px] w-[108px] object-contain" />
      <div className="text-[22px] font-bold text-[#65676b]">Belum ada komentar</div>
      <div className="mt-1 text-[17px] text-[#65676b]">
        Jadilah yang pertama mengomentari.
      </div>
    </div>
  );
}

function CommentSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="mb-4 flex gap-2">
      <div className="fb-skeleton h-9 w-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <div className="inline-block max-w-full rounded-2xl bg-[#f0f2f5] px-3 py-3">
          <div className="fb-skeleton h-3 w-24 rounded-full" />
          <div className="fb-skeleton mt-3 h-3 w-56 max-w-full rounded-full" />
          {!compact && <div className="fb-skeleton mt-2 h-3 w-40 max-w-full rounded-full" />}
        </div>
        <div className="fb-skeleton ml-3 mt-2 h-2.5 w-20 rounded-full" />
      </div>
    </div>
  );
}

function CommentsSkeleton() {
  return (
    <div className="py-2">
      <CommentSkeleton />
      <CommentSkeleton compact />
      <CommentSkeleton />
    </div>
  );
}

function useModalScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [active]);
}

function ModalCloseButton({ onClick, label = "Tutup" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[35.99px] w-[35.99px] shrink-0 items-center justify-center rounded-full bg-[#e4e6eb] text-[#050505] hover:bg-[#d8dadf]"
      aria-label={label}
    >
      <CloseIcon />
    </button>
  );
}

function CommentsBlock({
  comments,
  commentsLoading
}: {
  comments: CommentType[];
  commentsLoading: boolean;
}) {
  if (commentsLoading) return <CommentsSkeleton />;
  if (comments.length === 0) return <EmptyCommentsPlaceholder />;

  return (
    <>
      {comments.map((comment) => (
        <div key={comment.id} className="mb-4 flex gap-2">
          <img
            src={comment.author.avatar || defaultProfile}
            alt={comment.author.name}
            className="h-9 w-9 rounded-full object-cover"
          />
          <div>
            <div className="rounded-2xl bg-[#f0f2f5] px-3 py-2">
              <div className="text-[13px] font-bold">{comment.author.name}</div>
              <div className="text-[15px] leading-5">{comment.text}</div>
            </div>
            <div className="mt-1 px-3 text-xs font-semibold text-[#65676b]">{comment.time}</div>
          </div>
        </div>
      ))}
    </>
  );
}

function CommentComposer({
  currentUser,
  commentText,
  setCommentText,
  onSubmitComment
}: {
  currentUser: Author | null;
  commentText: string;
  setCommentText: (value: string) => void;
  onSubmitComment: () => void;
}) {
  if (!currentUser) {
    return (
      <div className="rounded-full bg-[#f0f2f5] px-4 py-3 text-center text-sm font-semibold text-[#65676b]">
        Login untuk berkomentar
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <img
        src={currentUser.avatar || defaultProfile}
        alt={currentUser.name}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
      <div className="flex min-h-[48px] flex-1 items-center rounded-[18px] bg-[#f0f2f5] px-3">
        <input
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSubmitComment();
          }}
          placeholder="Tulis komentar..."
          className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-[#65676b]"
        />
        <button
          type="button"
          onClick={onSubmitComment}
          disabled={!commentText.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-full disabled:cursor-default"
          aria-label="Kirim komentar"
        >
          <PaperPlaneIcon active={Boolean(commentText.trim())} />
        </button>
      </div>
    </div>
  );
}

function CommentModal({
  post,
  currentUser,
  comments,
  commentsLoading,
  commentText,
  setCommentText,
  onClose,
  onSubmitComment,
  onToggleLike,
  liked,
  likeCount,
  likeAnimating
}: {
  post: PostType;
  currentUser: Author | null;
  comments: CommentType[];
  commentsLoading: boolean;
  commentText: string;
  setCommentText: (value: string) => void;
  onClose: () => void;
  onSubmitComment: () => void;
  onToggleLike: () => void;
  liked: boolean;
  likeCount: number;
  likeAnimating: boolean;
}) {
  useModalScrollLock(true);
  const hasLikes = likeCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/75 px-2 py-2 backdrop-blur-sm">
      <div className="flex h-[96dvh] w-full max-w-[700px] flex-col overflow-hidden rounded-lg bg-white shadow-[0_12px_28px_rgba(0,0,0,0.22)] sm:max-h-[92vh]">
        <div className="relative z-10 flex min-h-[64px] items-center justify-center border-b border-[#e4e6eb] px-14 shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
          <h2 className="truncate text-[20px] font-bold">Postingan {post.author.name}</h2>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <ModalCloseButton onClick={onClose} aria-label="Tutup komentar" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <article className="border-b border-[#e4e6eb]">
            <div className="flex items-center gap-3 px-4 py-3">
              <img
                src={post.author.avatar || defaultProfile}
                alt={post.author.name}
                className="h-[38px] w-[38px] rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-bold">{post.author.name}</div>
                <PrivacyMeta time={post.time} privacy={post.privacy} />
              </div>
            </div>

            {post.text && (
              <div className="px-4 pb-4">
                <ExpandableText text={post.text} />
              </div>
            )}

            {post.image && (
              <img src={post.image} alt="Gambar postingan" className="max-h-[460px] w-full object-cover" />
            )}

            <div className="flex items-center justify-between px-4 py-2 text-sm text-[#65676b]">
              <div>
                {hasLikes && (
                  <div className="flex items-center gap-2">
                    <LikeBadge />
                    <span>{formatLikeSummary(likeCount, liked)}</span>
                  </div>
                )}
              </div>
              <span className="flex items-center gap-1">
                <CommentCountLabel count={comments.length} />
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1">
              <button
                type="button"
                onClick={onToggleLike}
                className={`flex h-10 items-center justify-center gap-2 rounded-md text-[15px] font-semibold hover:bg-[#f0f2f5] ${
                  liked ? "text-[#1877f2]" : "text-[#6f7276]"
                }`}
              >
                <span className={`inline-flex translate-y-[1px] ${likeAnimating ? "post-like-pop" : ""}`}>
                  <IconThumb active={liked} />
                </span>
                Suka
              </button>
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-2 rounded-md text-[15px] font-semibold text-[#6f7276] hover:bg-[#f0f2f5]"
              >
                <IconComment variant="outline" />
                <span>Komentari</span>
              </button>
            </div>
          </article>

          <div className="px-4 py-4">
            <CommentsBlock comments={comments} commentsLoading={commentsLoading} />
          </div>
        </div>

        <div className="border-t border-[#e4e6eb] px-4 py-3">
          <CommentComposer
            currentUser={currentUser}
            commentText={commentText}
            setCommentText={setCommentText}
            onSubmitComment={onSubmitComment}
          />
        </div>
      </div>
    </div>
  );
}

function ImageDetailModal({
  post,
  currentUser,
  comments,
  commentsLoading,
  commentText,
  setCommentText,
  onClose,
  onSubmitComment,
  onToggleLike,
  liked,
  likeCount,
  likeAnimating
}: {
  post: PostType;
  currentUser: Author | null;
  comments: CommentType[];
  commentsLoading: boolean;
  commentText: string;
  setCommentText: (value: string) => void;
  onClose: () => void;
  onSubmitComment: () => void;
  onToggleLike: () => void;
  liked: boolean;
  likeCount: number;
  likeAnimating: boolean;
}) {
  useModalScrollLock(true);
  const navigate = useNavigate();
  const viewerRef = useRef<HTMLDivElement>(null);
  const imageAreaRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const hasLikes = likeCount > 0;
  const fullscreenActive = isFullscreen || isPseudoFullscreen;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === imageAreaRef.current);
      if (document.fullscreenElement) setIsPseudoFullscreen(false);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await imageAreaRef.current?.requestFullscreen();
    } catch {
      setIsPseudoFullscreen((value) => !value);
    }
  };

  return (
    <div ref={viewerRef} className="fixed inset-0 z-50 flex flex-col bg-[#111] text-[#050505] md:flex-row">
      <div
        ref={imageAreaRef}
        className={`relative flex h-[46dvh] w-full shrink-0 items-center justify-center bg-[#111] md:h-full md:min-w-0 md:flex-1 ${
          isPseudoFullscreen ? "fixed inset-0 z-[70] !h-dvh !w-screen" : ""
        }`}
      >
        <div className="absolute left-5 top-5 z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            title="Tekan Esc untuk Menutup"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#050505] hover:bg-[#e4e6eb]"
            aria-label="Tutup detail"
          >
            <CloseIcon />
            <span className="pointer-events-none absolute left-0 top-[48px] hidden whitespace-nowrap rounded-md bg-[#050505] px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block">
              Tekan Esc untuk Menutup
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="Kembali ke beranda"
          >
            <img src={facebookIcon} alt="" className="h-10 w-10 rounded-full object-contain" />
          </button>
        </div>
        <div className="absolute right-5 top-5 z-10">
          <button
            type="button"
            onClick={toggleFullscreen}
            title={fullscreenActive ? "Keluar Layar Penuh" : "Masuk Layar Penuh"}
            className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#050505] text-white hover:bg-[#242526]"
            aria-label={fullscreenActive ? "Keluar Layar Penuh" : "Masuk Layar Penuh"}
          >
            <FullscreenIcon active={fullscreenActive} />
            <span className="pointer-events-none absolute right-0 top-[52px] hidden whitespace-nowrap rounded-md bg-[#050505] px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block">
              {fullscreenActive ? "Keluar Layar Penuh" : "Masuk Layar Penuh"}
            </span>
          </button>
        </div>
        <img src={post.image} alt="Gambar postingan" className="h-full w-full object-contain" />
      </div>

      <div className={`flex min-h-0 w-full flex-1 flex-col bg-white md:h-full md:w-[350px] md:max-w-[350px] md:flex-none ${isPseudoFullscreen ? "hidden" : ""}`}>
        <div className="relative hidden min-h-[64px] items-center justify-center border-b border-[#e4e6eb] px-14 md:flex" />

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 md:py-4">
          <div className="mb-3 flex items-center gap-3">
            <img src={post.author.avatar || defaultProfile} alt={post.author.name} className="h-[38px] w-[38px] rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-bold">{post.author.name}</div>
              <PrivacyMeta time={post.time} privacy={post.privacy} />
            </div>
          </div>

          {post.text && <ExpandableText text={post.text} />}

          <div className="mt-5 flex items-center justify-between text-sm text-[#65676b]">
            <div>
              {hasLikes && (
                <div className="flex items-center gap-2">
                  <LikeBadge />
                  <span>{formatLikeSummary(likeCount, liked)}</span>
                </div>
              )}
            </div>
            <span className="flex items-center gap-1">
              <CommentCountLabel count={comments.length} />
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1 border-t border-[#e4e6eb] pt-1">
            <button
              type="button"
              onClick={onToggleLike}
              className={`flex h-10 items-center justify-center gap-2 rounded-md text-[15px] font-semibold hover:bg-[#f0f2f5] ${
                liked ? "text-[#1877f2]" : "text-[#6f7276]"
              }`}
            >
              <span className={`inline-flex translate-y-[1px] ${likeAnimating ? "post-like-pop" : ""}`}>
                <IconThumb active={liked} />
              </span>
              Suka
            </button>
            <button type="button" className="flex h-10 items-center justify-center gap-2 rounded-md text-[15px] font-semibold text-[#6f7276] hover:bg-[#f0f2f5]">
              <IconComment variant="outline" />
              <span>Komentari</span>
            </button>
          </div>

          <div className="py-4">
            <CommentsBlock comments={comments} commentsLoading={commentsLoading} />
          </div>
        </div>

        <div className="border-t border-[#e4e6eb] px-4 py-3">
          <CommentComposer currentUser={currentUser} commentText={commentText} setCommentText={setCommentText} onSubmitComment={onSubmitComment} />
        </div>
      </div>
    </div>
  );
}

function EditPostModal({
  post,
  currentUser,
  onClose,
  onSave
}: {
  post: PostType;
  currentUser: Author | null;
  onClose: () => void;
  onSave: (text: string, image?: string) => Promise<void> | void;
}) {
  const [text, setText] = useState(post.text ?? "");
  const [previewImage, setPreviewImage] = useState(post.image);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useModalScrollLock(true);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(text.trim(), previewImage);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/75 px-2 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-[500px] flex-col overflow-hidden rounded-lg bg-white shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
        <div className="relative flex min-h-[64px] items-center justify-center border-b border-[#e4e6eb] px-14">
          <h2 className="text-[24px] font-bold">Edit postingan</h2>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <ModalCloseButton onClick={onClose} label="Tutup edit" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex items-center gap-3">
            <img src={currentUser?.avatar || post.author.avatar || defaultProfile} alt={post.author.name} className="h-[38px] w-[38px] rounded-full object-cover" />
            <div>
              <div className="text-[15px] font-bold">{currentUser?.name ?? post.author.name}</div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-[#e4e6eb] px-2 py-1 text-xs font-bold">
                <GlobeIcon />
                Publik
              </div>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-h-[150px] w-full resize-none border-0 bg-transparent text-[24px] outline-none placeholder:text-[#65676b]"
            placeholder={`Apa yang Anda pikirkan, ${currentUser?.name?.split(" ")[0] ?? "Anda"}?`}
          />

          {previewImage && (
            <div className="relative mb-4 overflow-hidden rounded-lg border border-[#e4e6eb]">
              <img src={previewImage} alt="Pratinjau" className="max-h-[320px] w-full object-contain" />
              <button
                type="button"
                onClick={() => setPreviewImage(undefined)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#050505] shadow"
                aria-label="Hapus gambar"
              >
                <CloseIcon />
              </button>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between rounded-lg border border-[#ced0d4] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.16)]">
            <span className="text-[15px] font-bold">Tambahkan ke postingan Anda</span>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#f0f2f5]" aria-label="Tambah gambar">
              <img src={photoIcon} alt="" className="h-7 w-7 object-contain" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || (!text.trim() && !previewImage)}
            className="h-12 w-full rounded-md bg-[#1877f2] text-[15px] font-bold text-white disabled:bg-[#e4e6eb] disabled:text-[#bcc0c4]"
          >
            Simpan
          </button>
        </div>

        {isSaving && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/72 backdrop-blur-md">
            <div className="fb-spinner h-11 w-11 rounded-full border-[3px] border-[#050505]/20 border-t-[#050505]" />
            <div className="mt-4 text-[24px]">Menyimpan</div>
          </div>
        )}
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  onCancel,
  onConfirm
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useModalScrollLock(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/75 px-2 backdrop-blur-sm">
      <div className="w-full max-w-[500px] overflow-hidden rounded-lg bg-white shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
        <div className="relative flex min-h-[72px] items-center justify-center border-b border-[#e4e6eb] px-14">
          <h2 className="text-[24px] font-bold">Hapus postingan?</h2>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <ModalCloseButton onClick={onCancel} label="Tutup hapus" />
          </div>
        </div>
        <div className="px-5 py-4 text-[15px] leading-5">
          Postingan ini akan langsung dihapus dan tidak akan tampil lagi di beranda.
        </div>
        <div className="flex justify-end gap-3 px-5 pb-5">
          <button type="button" onClick={onCancel} className="rounded-md px-4 py-2 text-[15px] font-bold text-[#1877f2] hover:bg-[#f0f2f5]">
            Batalkan
          </button>
          <button type="button" onClick={onConfirm} className="rounded-md bg-[#1877f2] px-8 py-2 text-[15px] font-bold text-white hover:bg-[#166fe5]">
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PostCard({ post, currentUser, onEditPost, onDeletePost }: PostCardProps) {
  const { token } = useAuthStore();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [comments, setComments] = useState<CommentType[]>(post.comments ?? []);
  const [commentsLoaded, setCommentsLoaded] = useState((post.comments ?? []).length > 0);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showImageDetail, setShowImageDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayCommentCount = commentsLoaded ? comments.length : post.commentCount ?? comments.length;
  const hasLikes = likeCount > 0;
  const isOwnPost = currentUser?.name === post.author.name;

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const loadComments = async () => {
    if (commentsLoaded || commentsLoading) return;

    setCommentsLoading(true);
    try {
      const result = await getCommentsByPostId(post.id);
      setComments((result.data ?? result).map(mapApiComment));
      setCommentsLoaded(true);
    } catch (error: any) {
      alert(error.message || "Gagal memuat komentar.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const openComments = () => {
    setShowComments(true);
    loadComments();
  };

  const openImageDetail = () => {
    setShowImageDetail(true);
    loadComments();
  };

  const handleLike = async () => {
    if (!token) {
      alert("Silakan login terlebih dahulu untuk menyukai postingan.");
      return;
    }

    setLikeAnimating(true);
    window.setTimeout(() => setLikeAnimating(false), 520);

    try {
      const result = await toggleLike(post.id, token);
      setLiked(result.data.liked);
      setLikeCount(result.data.likeCount);
    } catch (error: any) {
      alert(error.message || "Gagal memproses suka.");
    }
  };

  const handleSubmitComment = async () => {
    const value = commentText.trim();
    if (!value) return;

    try {
      const result = await createComment(post.id, value);
      const created = mapApiComment(result.data ?? result);
      setComments((current) => [...current, created]);
      setCommentsLoaded(true);
      setCommentText("");
    } catch (error: any) {
      alert(error.message || "Gagal mengirim komentar.");
    }
  };

  const handleEditSave = async (text: string, image?: string) => {
    await onEditPost?.(post.id, text, image);
  };

  const handleDelete = async () => {
    await onDeletePost?.(post.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <article className="mb-4 overflow-hidden rounded-lg bg-white shadow-[0_1px_3px_rgba(0,0,0,0.24)]">
        <div className="flex items-center justify-between px-4 pt-3">
          <div className="flex min-w-0 items-center gap-3">
            <img src={post.author.avatar || defaultProfile} alt={post.author.name} className="h-[38px] w-[38px] rounded-full object-cover" />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold">
                {post.author.name}
              </div>
              <PrivacyMeta time={post.time} privacy={post.privacy} />
            </div>
          </div>

          {isOwnPost && (
            <div ref={menuRef} className="relative">
              <button type="button" onClick={() => setShowMenu((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#65676b] hover:bg-[#f0f2f5]" aria-label="Menu postingan">
                <MoreIcon />
              </button>
              {showMenu && (
              <div className="absolute right-1 top-10 z-10 w-56 rounded-[10px] rounded-tr-none bg-white px-3 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.22)] before:absolute before:right-0 before:top-[-10px] before:h-0 before:w-0 before:border-b-[12px] before:border-l-[12px] before:border-b-white before:border-l-transparent before:content-['']">
                <button type="button" onClick={() => { setShowEditModal(true); setShowMenu(false); }} className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm font-semibold hover:bg-[#f0f2f5]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#050505]">
                    <EditPostIcon />
                  </span>
                  <span>
                      Edit postingan
                  </span>
                </button>
                <button type="button" onClick={() => { setShowDeleteModal(true); setShowMenu(false); }} className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm font-semibold hover:bg-[#f0f2f5]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#050505]">
                    <DeletePostIcon />
                  </span>
                  <span>
                      Hapus postingan
                  </span>
                </button>
              </div>
              )}
            </div>
          )}
        </div>

        {post.text && (
          <div className="px-4 py-3">
            <ExpandableText text={post.text} />
          </div>
        )}

        {post.image && (
          <button type="button" onClick={openImageDetail} className="block w-full" aria-label="Buka detail gambar">
            <img src={post.image} alt="Gambar postingan" className="max-h-[500px] w-full object-cover" />
          </button>
        )}

        <div className="flex items-center justify-between px-4 py-2 text-sm text-[#65676b]">
          <div>
            {hasLikes && (
              <div className="flex items-center gap-2">
                <LikeBadge />
                <span>{formatLikeSummary(likeCount, liked)}</span>
              </div>
            )}
          </div>
          <button type="button" onClick={openComments} className="flex items-center gap-1 hover:underline">
            <CommentCountLabel count={displayCommentCount} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1">
          <button
            type="button"
            onClick={handleLike}
            className={`flex h-10 items-center justify-center gap-2 rounded-md text-[15px] font-semibold hover:bg-[#f0f2f5] ${
              liked ? "text-[#1877f2]" : "text-[#6f7276]"
            }`}
          >
            <span className={`inline-flex translate-y-[1px] ${likeAnimating ? "post-like-pop" : ""}`}>
              <IconThumb active={liked} />
            </span>
            Suka
          </button>

          <button type="button" onClick={openComments} className="flex h-10 items-center justify-center gap-2 rounded-md text-[15px] font-semibold text-[#6f7276] hover:bg-[#f0f2f5]">
            <IconComment variant="outline" />
            <span>Komentari</span>
          </button>
        </div>
      </article>

      {showComments && (
        <CommentModal
          post={post}
          currentUser={currentUser}
          comments={comments}
          commentsLoading={commentsLoading}
          commentText={commentText}
          setCommentText={setCommentText}
          onClose={() => setShowComments(false)}
          onSubmitComment={handleSubmitComment}
          onToggleLike={handleLike}
          liked={liked}
          likeCount={likeCount}
          likeAnimating={likeAnimating}
        />
      )}

      {showImageDetail && (
        <ImageDetailModal
          post={post}
          currentUser={currentUser}
          comments={comments}
          commentsLoading={commentsLoading}
          commentText={commentText}
          setCommentText={setCommentText}
          onClose={() => setShowImageDetail(false)}
          onSubmitComment={handleSubmitComment}
          onToggleLike={handleLike}
          liked={liked}
          likeCount={likeCount}
          likeAnimating={likeAnimating}
        />
      )}

      {showEditModal && (
        <EditPostModal
          post={post}
          currentUser={currentUser}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}

      {showDeleteModal && <DeleteConfirmModal onCancel={() => setShowDeleteModal(false)} onConfirm={handleDelete} />}
    </>
  );
}
