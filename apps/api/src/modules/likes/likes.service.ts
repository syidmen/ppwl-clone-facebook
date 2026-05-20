import { prisma } from "../../db";
import { createNotification } from "../notifications/notification.service";

export const toggleLikeService = async (postId: string, userId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      userId: true
    }
  });

  if (!post) {
    throw new Error("Post tidak ditemukan");
  }

  const existingLike = await prisma.postLike.findUnique({
    where: {
      postId_userId: {
        postId,
        userId
      }
    }
  });

  let liked = false;

  if (existingLike) {
    await prisma.postLike.delete({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    });
  } else {
    await prisma.postLike.create({
      data: {
        postId,
        userId
      }
    });

    liked = true;
    await createNotification(post.userId, userId, "like", postId);
  }

  const likeCount = await prisma.postLike.count({
    where: { postId }
  });

  return {
    liked,
    likeCount
  };
};
