const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const fetchMe = async (token: string) => {
  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};