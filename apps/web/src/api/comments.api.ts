import { useAuthStore } from '../stores/auth.store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getCommentsByPostId = async (postId: string) => {
  const response = await fetch(`${API_URL}/posts/${postId}/comments`);
  
  if (!response.ok) {
    throw new Error('Gagal memuat komentar dari server');
  }
  
  return response.json();
};


export const createComment = async (postId: string, content: string) => {
  const token = useAuthStore.getState().token;

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
    throw new Error(errorData.message || 'Gagal mengirim komentar');
  }

  return response.json();
};