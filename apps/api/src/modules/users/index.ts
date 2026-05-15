import { Elysia, t } from 'elysia';
import { prisma } from '../../db';
import { authMiddleware } from '../../middleware/auth.middleware';

export const userModule = new Elysia()
  .get('/users', async ({ query, set }) => {
    const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || '1f4458fb008bc9198a1ecfebb8cd8553';
    if (query.key !== ADMIN_KEY) {
      set.status = 403;
      return { error: 'Akses ditolak' };
    }
    return await prisma.user.findMany({
      select: { id: true, name: true, username: true, email: true, createdAt: true }
    });
  }, {
    query: t.Object({ key: t.String() })
  })
  .group('/me', (app) => 
    app
      .use(authMiddleware)
      .get('', ({ user, set }) => {
        // Kita paksa cek di sini jika middleware-nya masih 'bolong'
        if (!user) {
          set.status = 401;
          return { error: 'Unauthorized: Silakan login' };
        }
        return user;
      })
  );