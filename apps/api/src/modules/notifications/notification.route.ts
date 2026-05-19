import { Elysia, t } from 'elysia';
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from './notification.service';
import { authMiddleware } from '../../middleware/auth.middleware';

export const notificationRoutes = new Elysia({ prefix: '/notifications' })
  .use(authMiddleware)
  .get('/', async ({ authUser }) => {
    const userId = authUser!.sub;
    const notifications = await getUserNotifications(userId);

    const mappedNotifications = notifications.map((notification) => ({
      id: notification.id,
      user_id: notification.userId,
      actor_id: notification.actorId,
      type: notification.type.toLowerCase(),
      post_id: notification.postId,
      comment_id: notification.commentId,
      message: notification.message,
      is_read: notification.isRead,
      created_at: notification.createdAt.toISOString(),
      actor: notification.actor
        ? {
            id: notification.actor.id,
            name: notification.actor.name,
            username: notification.actor.username,
            avatar_url: notification.actor.avatarUrl
          }
        : null,
      post: notification.post
    }));

    return {
      notifications: mappedNotifications,
      unreadCount: notifications.filter((notification) => !notification.isRead).length
    };
  })
  .patch('/read-all', async ({ authUser }) => {
    await markAllNotificationsAsRead(authUser!.sub);
    return { success: true, message: 'All notifications marked as read' };
  })
  .patch('/:id/read', async ({ params: { id }, authUser }) => {
    await markNotificationAsRead(id, authUser!.sub);
    return { success: true, message: 'Notification marked as read' };
  }, {
    params: t.Object({
      id: t.String()
    })
  });
