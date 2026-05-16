import { Elysia, t } from "elysia";
import { prisma } from "../../db";
import { comparePassword, hashPassword } from "../../utils/password";
import { jwtConfig } from "../../utils/token";

type AuthUserRecord = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  provider: string;
  createdAt: Date;
};

function toAuthUser(user: AuthUserRecord) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    provider: user.provider.toLowerCase(),
    createdAt: user.createdAt.toISOString()
  };
}

export const authModule = new Elysia({ prefix: "/auth" })
  .use(jwtConfig)
  .post(
    "/register",
    async ({ body, jwt, set }) => {
      const existing = await prisma.user.findFirst({
        where: { OR: [{ email: body.email }, { username: body.username }] }
      });

      if (existing) {
        set.status = 409;
        return { message: "Email atau username sudah terdaftar" };
      }

      const user = await prisma.user.create({
        data: {
          name: body.name.trim(),
          username: body.username.trim(),
          email: body.email.toLowerCase().trim(),
          passwordHash: await hashPassword(body.password),
          provider: "EMAIL"
        }
      });

      const token = await jwt.sign({ sub: user.id, email: user.email });
      return { user: toAuthUser(user), token };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        username: t.String({ minLength: 3 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 })
      })
    }
  )
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      const user = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase().trim() }
      });

      const validPassword = user?.passwordHash
        ? await comparePassword(body.password, user.passwordHash)
        : false;

      if (!user || !validPassword) {
        set.status = 401;
        return { message: "Email atau password salah" };
      }

      const token = await jwt.sign({ sub: user.id, email: user.email });
      return { user: toAuthUser(user), token };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 })
      })
    }
  )
  .post(
    "/google",
    ({ set }) => {
      set.status = 501;
      return { message: "Google OAuth belum diimplementasikan pada tahap ini" };
    },
    {
      body: t.Object({
        token: t.String({ minLength: 1 })
      })
    }
  );
