import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createNotification = async (
  userId: bigint,
  actorId: bigint,
  type: 'like' | 'comment' | 'follow',
  postId?: bigint,
  commentId?: bigint
) => {

  if (userId === actorId) return null;

  return await prisma.notifications.create({
    data: {
      user_id: userId,
      actor_id: actorId,
      type,
      post_id: postId,
      comment_id: commentId,
      is_read: false,
    },
  });
};

export const getUserNotifications = async (userId: bigint) => {
  return await prisma.notifications.findMany({
    where: { user_id: userId },
    include: {
      actor: {
        select: { id: true, name: true, avatar_url: true },
      },
      post: {
        select: { id: true, content: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

export const markNotificationAsRead = async (id: bigint, userId: bigint) => {
  return await prisma.notifications.updateMany({
    where: {
      id: id,
      user_id: userId,
    },
    data: {
      is_read: true,
    },
  });
};