import { jwt } from "@elysiajs/jwt";
import { env } from "../env";

const secret = env("JWT_SECRET");

if (!secret) {
  throw new Error("JWT_SECRET belum diset di environment. Salin apps/api/.env.example ke apps/api/.env terlebih dahulu.");
}

export type AuthTokenPayload = {
  sub: string;
  email: string;
};

export const jwtConfig = jwt({
  name: "jwt",
  secret
});
