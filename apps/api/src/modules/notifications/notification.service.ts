import { prisma } from '../../db';

export const createNotification = async (
  userId: string,
  actorId: string,
  type: 'like' | 'comment',
  postId?: string,
  commentId?: string
) => {
  if (userId === actorId) return null;

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { name: true }
  });

  const action = type === 'like' ? 'menyukai' : 'mengomentari';
  const message = `${actor?.name ?? 'Seseorang'} ${action} postingan kamu`;

  if (type === 'like' && postId) {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId,
        actorId,
        type: 'LIKE',
        postId
      }
    });

    if (existingNotification) {
      return await prisma.notification.update({
        where: { id: existingNotification.id },
        data: {
          message,
          isRead: false,
          createdAt: new Date()
        }
      });
    }
  }

  return await prisma.notification.create({
    data: {
      userId,
      actorId,
      type: type.toUpperCase() as 'LIKE' | 'COMMENT',
      postId,
      commentId,
      message,
      isRead: false
    }
  });
};

export const getUserNotifications = async (userId: string) => {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  const actorIds = notifications
    .map((notification) => notification.actorId)
    .filter((actorId): actorId is string => Boolean(actorId));
  const postIds = notifications
    .map((notification) => notification.postId)
    .filter((postId): postId is string => Boolean(postId));

  const [actors, posts] = await Promise.all([
    actorIds.length
      ? prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, name: true, username: true, avatarUrl: true }
        })
      : [],
    postIds.length
      ? prisma.post.findMany({
          where: { id: { in: postIds } },
          select: { id: true, content: true }
        })
      : []
  ]);

  const actorsById = new Map(actors.map((actor) => [actor.id, actor]));
  const postsById = new Map(posts.map((post) => [post.id, post]));

  return notifications.map((notification) => ({
    ...notification,
    actor: notification.actorId ? actorsById.get(notification.actorId) ?? null : null,
    post: notification.postId ? postsById.get(notification.postId) ?? null : null
  }));
};

export const markNotificationAsRead = async (id: string, userId: string) => {
  return await prisma.notification.updateMany({
    where: {
      id,
      userId
    },
    data: {
      isRead: true
    }
  });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  return await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false
    },
    data: {
      isRead: true
    }
  });
};
