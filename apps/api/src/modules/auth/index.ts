import { Elysia, t } from "elysia";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../db";
import { env } from "../../env";
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

function slugifyUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18);
}

async function makeUniqueUsername(email: string, name: string) {
  const emailName = email.split("@")[0] ?? "";
  const base = slugifyUsername(emailName || name) || "user";

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = attempt === 0 ? "" : String(attempt);
    const username = `${base}${suffix}`.slice(0, 20);
    const existing = await prisma.user.findUnique({ where: { username } });

    if (!existing) {
      return username;
    }
  }

  return `user_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

const googleClient = new OAuth2Client();

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
    async ({ body, jwt, set }) => {
      const googleClientId = env("GOOGLE_CLIENT_ID");

      if (!googleClientId) {
        set.status = 500;
        return { message: "GOOGLE_CLIENT_ID belum diset di backend" };
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: body.token,
        audience: googleClientId
      }).catch(() => null);

      if (!ticket) {
        set.status = 401;
        return { message: "Token Google tidak valid" };
      }

      const payload = ticket.getPayload();

      if (!payload?.sub || !payload.email) {
        set.status = 401;
        return { message: "Token Google tidak valid" };
      }

      const email = payload.email.toLowerCase().trim();
      const providerId = payload.sub;
      const name = payload.name?.trim() || email.split("@")[0] || "Google User";
      const avatarUrl = payload.picture ?? null;

      const userByProvider = await prisma.user.findUnique({
        where: { providerId }
      });
      const userByEmail = userByProvider
        ? null
        : await prisma.user.findUnique({ where: { email } });

      const user =
        userByProvider ??
        (userByEmail
          ? await prisma.user.update({
              where: { id: userByEmail.id },
              data: {
                provider: "GOOGLE",
                providerId,
                avatarUrl: userByEmail.avatarUrl ?? avatarUrl,
                emailVerifiedAt: payload.email_verified ? new Date() : undefined
              }
            })
          : await prisma.user.create({
              data: {
                name,
                username: await makeUniqueUsername(email, name),
                email,
                avatarUrl,
                provider: "GOOGLE",
                providerId,
                emailVerifiedAt: payload.email_verified ? new Date() : undefined
              }
            }));

      const token = await jwt.sign({ sub: user.id, email: user.email });
      return { user: toAuthUser(user), token };
    },
    {
      body: t.Object({
        token: t.String({ minLength: 1 })
      })
    }
  );
