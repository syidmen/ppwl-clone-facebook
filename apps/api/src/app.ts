import { commentsRoutes } from "./modules/comments";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { env } from "./env";
import { authModule } from "./modules/auth";
import { notificationRoutes } from "./modules/notifications";
import { userModule } from "./modules/users";
import { postsModule } from "./modules/posts";
import { likesModule } from "./modules/likes";

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

  .get("/health", () => ({
    ok: true,
    service: "ppwl-api"
  }))

  .use(authModule)
  .use(userModule)
  .use(postsModule)
  .use(likesModule)
  .use(commentsRoutes);
  .use(commentsRoutes)
  .use(notificationRoutes); 
