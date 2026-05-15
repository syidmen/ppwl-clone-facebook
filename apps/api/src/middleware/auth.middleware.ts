import { Elysia } from 'elysia';
import { jwtConfig } from '../utils/token';

export const authMiddleware = new Elysia()
  .use(jwtConfig)
  .derive({ as: 'global' }, async ({ jwt, headers }) => {
    const auth = headers['authorization'];
    
    if (!auth || !auth.startsWith('Bearer ')) {
      return { user: null };
    }

    const token = auth.slice(7);
    const profile = await jwt.verify(token);

    return { user: profile || null };
  })
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { 
        status: 'error',
        message: 'Unauthorized: Silakan login terlebih dahulu' 
      };
    }
  });