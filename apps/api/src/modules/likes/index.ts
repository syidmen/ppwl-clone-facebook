import { Elysia } from "elysia";

import { authMiddleware } from "../../middleware/auth.middleware";

import {
  toggleLikeController
} from "./likes.controller";

export const likesModule = new Elysia({
  prefix: "/posts"
})

.group("", (app) =>
  app

    .use(authMiddleware)

    .post(
      "/:id/like",
      toggleLikeController
    )
);