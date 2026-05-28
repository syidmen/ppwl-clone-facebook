import { Elysia, t } from "elysia";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createPostController,
  deletePostController,
  getPostByIdController,
  getPostsController,
  getUploadUrlController,
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
        "/upload-url",
        getUploadUrlController,
        {
          body: t.Object({
            contentType: t.String()
          })
        }
      )

      .post(
        "/",
        createPostController,
        {
          body: t.Object({
            content: t.String(),
            imageUrl: t.Optional(t.String())
          })
        }
      )

      .patch("/:id", updatePostController)

      .delete("/:id", deletePostController)
  );
