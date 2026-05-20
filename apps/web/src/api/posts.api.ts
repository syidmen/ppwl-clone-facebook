const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type PostInput = {
  content: string;
  imageUrl?: string;
};

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? data?.error ?? "Request post gagal");
  }

  return data as T;
}

export const getPosts = async () => {
  return request<{ success: boolean; data: any[] }>("/posts");
};

export const getPostById = async (postId: string) => {
  return request<{ success: boolean; data: any }>(`/posts/${postId}`);
};

export const createPost = async (data: PostInput, token: string) => {
  return request<{ success: boolean; data: any }>("/posts", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
};

export const updatePost = async (postId: string, data: PostInput, token: string) => {
  return request<{ success: boolean; data: any }>(`/posts/${postId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
};

export const deletePost = async (postId: string, token: string) => {
  return request<{ message: string }>(`/posts/${postId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const toggleLike = async (postId: string, token: string) => {
  return request<{ success: boolean; data: { liked: boolean; likeCount: number } }>(
    `/posts/${postId}/like`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    }
  );
};
