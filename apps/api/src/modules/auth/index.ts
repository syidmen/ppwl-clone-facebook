import { Elysia, t } from 'elysia';
import { prisma } from '../../db';
import { hashPassword, comparePassword } from '../../utils/password';
import { jwtConfig } from '../../utils/token';

export const authModule = new Elysia({ prefix: '/auth' })
  .use(jwtConfig)
  .post('/register', async ({ body, jwt, set }) => {
    const { name, username, email, password } = body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existing) {
      set.status = 400;
      return { error: 'Email atau Username sudah ada' };
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, username, email, passwordHash, provider: 'EMAIL' }
    });

    const token = await jwt.sign({ id: user.id, email: user.email });
    return { user: { id: user.id, name, username, email }, token };
  }, {
    body: t.Object({
      name: t.String(),
      username: t.String(),
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 })
    })
  })
  .post('/login', async ({ body, jwt, set }) => {
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !user.passwordHash || !(await comparePassword(body.password, user.passwordHash))) {
      set.status = 401;
      return { error: 'Email atau password salah' };
    }
    
    const token = await jwt.sign({ id: user.id, email: user.email });
    return { user: { id: user.id, name: user.name, username: user.username, email: user.email }, token };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  })
  .post('/google', async () => {
    return { message: "Google Auth Placeholder", token: "mock-google-token" };
  });