import { useAuthStore } from '../stores/auth.store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getComments = async () => {
  const response = await fetch(`${API_URL}/comments`);

  if (!response.ok) {
    throw new Error('Gagal memuat daftar komentar dari server');
  }

  return response.json();
};

export const getCommentsByPostId = async (postId: string) => {
  const response = await fetch(`${API_URL}/posts/${postId}/comments`);
  
  if (!response.ok) {
    throw new Error('Gagal memuat komentar dari server');
  }
  
  return response.json();
};


export const createComment = async (postId: string, content: string) => {
  const token = useAuthStore.getState().token;

  if (!token) {
    throw new Error('Silakan login terlebih dahulu untuk mengirim komentar');
  }

  const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, 
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.message ||
        errorData?.error ||
        `Gagal mengirim komentar (${response.status})`
    );
  }

  return response.json();
};
