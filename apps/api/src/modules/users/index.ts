import { Elysia, t } from "elysia";
import { env } from "../../env";
import { authMiddleware } from "../../middleware/auth.middleware";
import { prisma } from "../../db";

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
    app.use(authMiddleware).get("", async ({ authUser, set }) => {
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
  );
