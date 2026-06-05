import { PrismaClient } from "@prisma/client";

export const prismaPostgres = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_DATABASE_URL ?? process.env.DATABASE_URL
    }
  }
});
