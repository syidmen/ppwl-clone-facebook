import { Elysia, t } from "elysia";

import { authMiddleware } from "../../middleware/auth.middleware";

import {
  createPostController,
  deletePostController,
  getPostByIdController,
  getPostsController,
  updatePostController
} from "./posts.controller";

export const postsModule = new Elysia({
  prefix: "/posts"
})

.get("/", getPostsController)

.get("/:id", getPostByIdController)

.group("", (app) =>
  app

    .use(authMiddleware)

    .post(
      "/",
      createPostController,
      {
        body: t.Object({
          content: t.String({
            minLength: 1
          }),

          imageUrl: t.Optional(
            t.String()
          )
        })
      }
    )

    .patch(
      "/:id",
      updatePostController
    )

    .delete(
      "/:id",
      deletePostController
    )
);