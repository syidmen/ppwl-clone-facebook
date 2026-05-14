export const LIMITS = {
  maxPostsPerUser: 2,
  maxCommentsPerUser: 5,
  maxPostTextLength: 2000,
  maxCommentTextLength: 1000,
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
} as const;

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  isGoogle: boolean;
  avatarUrl: string | null;
  createdAt: string;
};

export type FeedPost = {
  id: string;
  text: string;
  imageUrl: string | null;
  author: PublicUser;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CommentItem = {
  id: string;
  text: string;
  author: PublicUser;
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  type: "LIKE" | "COMMENT";
  message: string;
  readAt: string | null;
  createdAt: string;
};

export type AuthUser = PublicUser & {
  token: string;
};

export function assertImageOnly(mimeType: string) {
  if (!LIMITS.allowedImageMimeTypes.includes(mimeType as never)) {
    throw new Error("Hanya file gambar yang diperbolehkan. Upload video tidak didukung.");
  }
}

export function isNonEmptyText(value: unknown, maxLength = LIMITS.maxPostTextLength): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}
