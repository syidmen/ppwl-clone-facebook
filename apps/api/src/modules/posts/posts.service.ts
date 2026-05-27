import { prisma } from "../../db";
import type { Post } from "./posts.types";

type PostWithCounts = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
};

const postInclude = {
  author: {
    select: {
      id: true,
      name: true,
      avatarUrl: true
    }
  },
  _count: {
    select: {
      likes: true,
      comments: true
    }
  }
};

function toPostDTO(post: PostWithCounts): Post {
  return {
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl ?? undefined,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    likedByMe: false
  };
}

function isVideoUrl(value?: string) {
  return Boolean(
    value &&
      (/\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(value) ||
        /youtube\.com|youtu\.be|vimeo\.com/i.test(value))
  );
}

export const getPostsService = async () => {
  const posts = await prisma.post.findMany({
    include: postInclude,
    orderBy: {
      createdAt: "desc"
    }
  });

  return posts.map(toPostDTO);
};

export const getPostByIdService = async (id: string) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: postInclude
  });

  return post ? toPostDTO(post) : null;
};

export const createPostService = async (
  user: any,
  body: {
    content: string;
    imageUrl?: string;
  }
) => {
  const userPosts = await prisma.post.count({
    where: {
      userId: user.sub
    }
  });

  if (userPosts >= 2) {
    throw new Error("Maksimal 2 post");
  }

  if (body.imageUrl && isVideoUrl(body.imageUrl)) {
    throw new Error("Video tidak diperbolehkan");
  }

  const newPost = await prisma.post.create({
    data: {
      userId: user.sub,
      content: body.content,
      imageUrl: body.imageUrl?.trim() || null
    },
    include: postInclude
  });

  return toPostDTO(newPost);
};

export const updatePostService = async (
  id: string,
  user: any,
  body: {
    content?: string;
    imageUrl?: string;
  }
) => {
  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true
    }
  });

  if (!post) {
    throw new Error("Post tidak ditemukan");
  }

  if (post.userId !== user.sub) {
    throw new Error("Forbidden");
  }

  if (body.imageUrl && isVideoUrl(body.imageUrl)) {
    throw new Error("Video tidak diperbolehkan");
  }

  const updatedPost = await prisma.post.update({
    where: { id },
    data: {
      ...(body.content !== undefined ? { content: body.content } : {}),
      ...(body.imageUrl !== undefined
        ? { imageUrl: body.imageUrl.trim() || null }
        : {})
    },
    include: postInclude
  });

  return toPostDTO(updatedPost);
};

export const deletePostService = async (id: string, user: any) => {
  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true
    }
  });

  if (!post) {
    throw new Error("Post tidak ditemukan");
  }

  if (post.userId !== user.sub) {
    throw new Error("Forbidden");
  }

  await prisma.post.delete({
    where: { id }
  });

  return {
    message: "Post berhasil dihapus"
  };
};