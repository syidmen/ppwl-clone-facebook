import { Elysia, t } from 'elysia';
import { getUserNotifications, markNotificationAsRead } from './notification.service';
import { authMiddleware } from '../../middleware/auth.middleware';

export const notificationRoutes = new Elysia({ prefix: '/notifications' })
  .use(authMiddleware)
  .get('/', async ({ authUser }) => {
    // @ts-ignore
    const userId = BigInt(authUser?.sub || authUser?.id || 0);
    
    const notifications = await getUserNotifications(userId);
    
    return notifications.map((notif: any) => ({ 
      ...notif,
      id: notif.id.toString(),
      user_id: notif.user_id.toString(),
      actor_id: notif.actor_id.toString(),
      post_id: notif.post_id?.toString(),
      comment_id: notif.comment_id?.toString(),
      actor: {
        ...notif.actor,
        id: notif.actor.id.toString()
      }
    }));
  })
  .patch('/:id/read', async ({ params: { id }, authUser }) => {
    // @ts-ignore
    const userId = BigInt(authUser?.sub || authUser?.id || 0);
    
    await markNotificationAsRead(BigInt(id), userId);
    return { success: true, message: 'Notification marked as read' };
  }, {
    params: t.Object({
      id: t.String()
    })
  });