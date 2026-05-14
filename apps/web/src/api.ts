import type { CommentItem, FeedPost, NotificationItem, PublicUser } from "@ppwl/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type RequestOptions = {
  token?: string | null;
  body?: unknown;
  method?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? (options.body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message ?? "Request gagal");
  }

  return response.json();
}

export type AuthResponse = PublicUser & { token: string };

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", { body }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { body }),

  /** Login via Google — kirim credential token dari @react-oauth/google ke backend */
  loginGoogle: (googleToken: string) =>
    request<AuthResponse>("/auth/google", { body: { token: googleToken } }),

  me: (token: string) => request<PublicUser>("/me", { token }),

  updateMe: (
    token: string,
    body: Partial<Pick<PublicUser, "name" | "email" | "avatarUrl">> & { password?: string }
  ) => request<PublicUser>("/me", { token, body, method: "PATCH" }),

  posts: (token?: string | null) => request<FeedPost[]>("/posts", { token }),

  postDetail: (id: string, token?: string | null) =>
    request<FeedPost & { comments: CommentItem[] }>(`/posts/${id}`, { token }),

  createPost: (token: string, body: { text: string; imageUrl?: string }) =>
    request<FeedPost>("/posts", { token, body }),

  likePost: (token: string, id: string) =>
    request<{ liked: boolean }>(`/posts/${id}/like`, { token, method: "POST" }),

  comment: (token: string, postId: string, body: { text: string }) =>
    request<CommentItem>(`/posts/${postId}/comments`, { token, body }),

  notifications: (token: string) => request<NotificationItem[]>("/notifications", { token }),

  markNotificationRead: (token: string, id: string) =>
    request<{ id: string }>(`/notifications/${id}/read`, { token, method: "PATCH" })
};
