import type { UserDTO } from "@ppwl/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type AuthResponse = {
  user: UserDTO;
  token: string;
};

export type UpdateMeBody = {
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  password?: string;
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
    throw new Error(data?.message ?? data?.error ?? "Request auth gagal");
  }

  return data as T;
}

export function register(body: { name: string; username: string; email: string; password: string }) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function login(body: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function googleLogin(token: string) {
  return request<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ token })
  });
}

export function fetchMe(token: string) {
  return request<UserDTO>("/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function updateMe(token: string, body: UpdateMeBody) {
  return request<UserDTO>("/me", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
}
