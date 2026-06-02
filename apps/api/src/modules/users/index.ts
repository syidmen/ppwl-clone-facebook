import { Elysia, t } from "elysia";
import { env } from "../../env";
import { authMiddleware } from "../../middleware/auth.middleware";
import { prisma } from "../../db";
import { hashPassword } from "../../utils/password";
import { createImageUploadUrl } from "../posts/upload.service";

function toPublicUser(user: {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  provider: string;
  createdAt: Date;
}) {
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

export const userModule = new Elysia()
  .get(
    "/users",
    async ({ query, set }) => {
      const adminKey = env("ADMIN_SECRET_KEY");

      if (!adminKey) {
        set.status = 500;
        return { message: "ADMIN_SECRET_KEY belum diset" };
      }

      if (query.key !== adminKey) {
        set.status = 403;
        return { message: "Akses ditolak" };
      }

      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatarUrl: true,
          provider: true,
          createdAt: true
        }
      });

      return users.map(toPublicUser);
    },
    {
      query: t.Object({ key: t.String() })
    }
  )
  .group("/me", (app) =>
    app
      .use(authMiddleware)
      .get("", async ({ authUser, set }) => {
        if (!authUser) {
          set.status = 401;
          return { message: "Unauthorized: silakan login" };
        }

        const user = await prisma.user.findUnique({
          where: { id: authUser.sub },
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            avatarUrl: true,
            provider: true,
            createdAt: true
          }
        });

        if (!user) {
          set.status = 404;
          return { message: "User tidak ditemukan" };
        }

        return toPublicUser(user);
      })
      .post(
        "/avatar-upload-url",
        async ({ authUser, body, set }) => {
          if (!authUser) {
            set.status = 401;
            return { message: "Unauthorized: silakan login" };
          }

          try {
            const data = await createImageUploadUrl(authUser.sub, body.contentType);
            return { success: true, data };
          } catch (error: any) {
            set.status = 400;
            return { message: error.message };
          }
        },
        {
          body: t.Object({
            contentType: t.String()
          })
        }
      )
      .patch(
        "",
        async ({ authUser, body, set }) => {
          if (!authUser) {
            set.status = 401;
            return { message: "Unauthorized: silakan login" };
          }

          const name = body.name.trim();
          const username = body.username.trim().toLowerCase();
          const email = body.email.trim().toLowerCase();
          const avatarUrl = body.avatarUrl?.trim() || null;
          const password = body.password?.trim();

          const duplicateUser = await prisma.user.findFirst({
            where: {
              id: { not: authUser.sub },
              OR: [{ email }, { username }]
            },
            select: { email: true, username: true }
          });

          if (duplicateUser) {
            set.status = 409;
            return {
              message:
                duplicateUser.email === email
                  ? "Email sudah digunakan user lain"
                  : "Username sudah digunakan user lain"
            };
          }

          const user = await prisma.user.update({
            where: { id: authUser.sub },
            data: {
              name,
              username,
              email,
              avatarUrl,
              ...(password ? { passwordHash: await hashPassword(password) } : {})
            },
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              avatarUrl: true,
              provider: true,
              createdAt: true
            }
          });

          return toPublicUser(user);
        },
        {
          body: t.Object({
            name: t.String({ minLength: 2 }),
            username: t.String({ minLength: 3 }),
            email: t.String({ format: "email" }),
            avatarUrl: t.Optional(t.String()),
            password: t.Optional(t.String({ minLength: 8 }))
          })
        }
      )
  );
