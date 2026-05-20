import { Elysia } from "elysia";
import { prisma } from "../db";
import { jwtConfig, type AuthTokenPayload } from "../utils/token";

export const authMiddleware = new Elysia()
  .use(jwtConfig)
  .derive({ as: "global" }, async ({ jwt, headers, set }) => {
    const authHeader = headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      set.status = 401;
      return { authUser: null };
    }

    const token = authHeader.slice(7);
    const payload = await jwt.verify(token);

    if (!payload || typeof payload.sub !== "string") {
      set.status = 401;
      return { authUser: null };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true }
    });

    if (!user) {
      set.status = 401;
      return { authUser: null };
    }

    return { authUser: payload as AuthTokenPayload };
  })
  .onBeforeHandle(({ authUser, set }) => {
    if (!authUser) {
      set.status = 401;
      return { message: "Unauthorized: silakan login terlebih dahulu" };
    }
  });
