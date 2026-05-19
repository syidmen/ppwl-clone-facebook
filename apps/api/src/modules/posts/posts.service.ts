import type { Post } from "./posts.types";
import { prisma } from "../../db";

export const dummyPosts: Post[] = [
  {
    id: "1",
    content: "Belajar PPWL 🔥",
    imageUrl: "https://picsum.photos/500",
    createdAt: new Date().toISOString(),

    author: {
      id: "u1",
      name: "Atikoh",
      avatarUrl: null
    },

    likeCount: 10,
    commentCount: 2,
    likedByMe: false
  },

  {
    id: "2",
    content: "Clone Facebook berjalan 🚀",
    createdAt: new Date().toISOString(),

    author: {
      id: "u2",
      name: "Budi",
      avatarUrl: null
    },

    likeCount: 5,
    commentCount: 1,
    likedByMe: true
  }
];

export const getPostsService = () => {
  return dummyPosts;
};

export const getPostByIdService = (id: string) => {
  return dummyPosts.find((post) => post.id === id);
};

export const createPostService = async (
  user: any,
  body: {
    content: string;
    imageUrl?: string;
  }
) => {
  const userPosts = dummyPosts.filter(
    (post) => post.author.id === user.sub
  );

  if (userPosts.length >= 2) {
    throw new Error("Maksimal 2 post");
  }

  if (body.imageUrl?.includes("mp4")) {
    throw new Error("Video tidak diperbolehkan");
  }

  const author = await prisma.user.findUnique({
    where: { id: user.sub },
    select: {
      id: true,
      name: true,
      avatarUrl: true
    }
  });

  if (!author) {
    throw new Error("User tidak ditemukan");
  }

  const newPost: Post = {
    id: Date.now().toString(),
    content: body.content,
    imageUrl: body.imageUrl,
    createdAt: new Date().toISOString(),

    author: {
      id: author.id,
      name: author.name,
      avatarUrl: author.avatarUrl
    },

    likeCount: 0,
    commentCount: 0,
    likedByMe: false
  };

  dummyPosts.unshift(newPost);

  return newPost;
};

export const updatePostService = (
  id: string,
  user: any,
  body: {
    content?: string;
    imageUrl?: string;
  }
) => {
  const post = dummyPosts.find((p) => p.id === id);

  if (!post) {
    throw new Error("Post tidak ditemukan");
  }

  if (post.author.id !== user.sub) {
    throw new Error("Forbidden");
  }

  if (body.imageUrl?.includes("mp4")) {
    throw new Error("Video tidak diperbolehkan");
  }

  post.content = body.content ?? post.content;
  post.imageUrl = body.imageUrl ?? post.imageUrl;

  return post;
};

export const deletePostService = (
  id: string,
  user: any
) => {
  const index = dummyPosts.findIndex(
    (p) => p.id === id
  );

  if (index === -1) {
    throw new Error("Post tidak ditemukan");
  }

  if (dummyPosts[index].author.id !== user.sub) {
    throw new Error("Forbidden");
  }

  dummyPosts.splice(index, 1);

  return {
    message: "Post berhasil dihapus"
  };
};
