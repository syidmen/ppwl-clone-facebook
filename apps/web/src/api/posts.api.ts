const API_URL = "http://localhost:3000";

export const getPosts = async () => {
  const response = await fetch(
    `${API_URL}/posts`
  );

  if (!response.ok) {
    throw new Error(
      "Gagal mengambil posts"
    );
  }

  return response.json();
};

export const createPost = async (
  data: {
    content: string;
    imageUrl?: string;
  },
  token: string
) => {
  const response = await fetch(
    `${API_URL}/posts`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`
      },

      body: JSON.stringify(data)
    }
  );

  return response.json();
};

export const toggleLike = async (
  postId: string,
  token: string
) => {
  const response = await fetch(
    `${API_URL}/posts/${postId}/like`,
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

  return response.json();
};