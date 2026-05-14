import type { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";

export type JwtPayload = {
  sub: string;
};

export function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isGoogle: user.isGoogle,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString()
  };
}

export async function requireUser(
  prisma: PrismaClient,
  userId: string | undefined
) {
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return user;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string | null) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}
