import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { env } from "./env";

const allowedOrigins = [
  env("WEB_ORIGIN", "http://localhost:5173")!,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

export const app = new Elysia()
  .use(cors({ origin: allowedOrigins }))
  .use(swagger())
  .get("/", () => ({
    service: "PPWL Social Media API",
    status: "ready",
    message: "Baseline API siap dikembangkan oleh tim."
  }))
  .get("/health", () => ({ ok: true, service: "ppwl-api" }));
