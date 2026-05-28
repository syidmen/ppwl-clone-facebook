import { prisma } from "../../db";
import type { Post } from "./posts.types";

type PostBody = {
  content?: string;
  imageUrl?: string;
};

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

function normalizeImageUrl(imageUrl?: string) {
  const value = imageUrl?.trim();
  return value ? value : null;
}

function isVideoUrl(value?: string | null) {
  return Boolean(
    value &&
      (/\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(value) ||
        /youtube\.com|youtu\.be|vimeo\.com/i.test(value))
  );
}

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
  const content = body.content.trim();
  const imageUrl = normalizeImageUrl(body.imageUrl);

  if (!content && !imageUrl) {
    throw new Error("Post wajib berisi teks atau gambar");
  }

  if (isVideoUrl(imageUrl)) {
    throw new Error("Video tidak diperbolehkan");
  }

  const postCount = await prisma.post.count({
    where: {
      userId: user.sub
    }
  });

  if (postCount >= 2) {
    throw new Error("Maksimal 2 post");
  }

  const post = await prisma.post.create({
    data: {
      userId: user.sub,
      content,
      imageUrl
    },
    include: postInclude
  });

  return toPostDTO(post);
};

export const updatePostService = async (
  id: string,
  user: any,
  body: PostBody
) => {
  const existingPost = await prisma.post.findUnique({
    where: { id },
    select: {
      userId: true
    }
  });

  if (!existingPost) {
    throw new Error("Post tidak ditemukan");
  }

  if (existingPost.userId !== user.sub) {
    throw new Error("Forbidden");
  }

  const imageUrl = normalizeImageUrl(body.imageUrl);

  if (isVideoUrl(imageUrl)) {
    throw new Error("Video tidak diperbolehkan");
  }

  const content = body.content?.trim();

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(content ? { content } : {}),
      ...(body.imageUrl !== undefined ? { imageUrl } : {})
    },
    include: postInclude
  });

  return toPostDTO(post);
};

export const deletePostService = async (id: string, user: any) => {
  const existingPost = await prisma.post.findUnique({
    where: { id },
    select: {
      userId: true
    }
  });

  if (!existingPost) {
    throw new Error("Post tidak ditemukan");
  }

  if (existingPost.userId !== user.sub) {
    throw new Error("Forbidden");
  }

  await prisma.post.delete({
    where: { id }
  });

  return {
    message: "Post berhasil dihapus"
  };
};
