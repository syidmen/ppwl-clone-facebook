import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger";
import { LIMITS, isNonEmptyText, type CommentItem } from "@ppwl/shared";
import { Elysia, t } from "elysia";
import { hashPassword, requireUser, toPublicUser, verifyPassword } from "./auth";
import { prisma } from "./db";
import { env } from "./env";

const allowedOrigins = [
  env("WEB_ORIGIN", "http://localhost:5173")!,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175"
];

// ─── Helper: validasi imageUrl bukan video ────────────────────────────────────
function validateImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return;
  const videoExtensions = /\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v|3gp|ogv)(\?.*)?$/i;
  const videoHosts = /youtu\.?be|vimeo\.com|dailymotion\.com|twitch\.tv/i;
  if (videoExtensions.test(imageUrl) || videoHosts.test(imageUrl)) {
    throw new Error("Upload video tidak diperbolehkan. Gunakan URL gambar (jpg, png, webp, gif).");
  }
}

// ─── Helper: verifikasi Google ID token via Google tokeninfo endpoint ─────────
async function verifyGoogleToken(idToken: string) {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  if (!res.ok) throw new Error("Token Google tidak valid");
  const data = (await res.json()) as {
    sub: string;
    email: string;
    name: string;
    picture?: string;
    email_verified?: string;
    aud: string;
  };

  const clientId = env("GOOGLE_CLIENT_ID");
  if (clientId && data.aud !== clientId) throw new Error("Client ID tidak cocok");
  if (data.email_verified !== "true") throw new Error("Email Google belum terverifikasi");

  return data;
}

export const app = new Elysia()
  .use(cors({ origin: allowedOrigins }))
  .use(swagger())
  .use(jwt({ name: "jwt", secret: env("JWT_SECRET", "dev-secret")! }))
  .derive(async ({ headers, jwt }) => {
    const auth = headers.authorization;
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
    const payload = token ? await jwt.verify(token) : false;
    return { userId: payload && typeof payload.sub === "string" ? payload.sub : undefined };
  })
  .get("/", () => ({
    service: "PPWL Clone Facebook API",
    status: "running",
    endpoints: {
      health: "/health",
      users: "/users?key=your-secret-key",
      posts: "/posts",
      comments: "/comments",
      notifications: "/notifications"
    }
  }))
  .get("/health", () => ({ ok: true, service: "ppwl-api" }))
  .get("/users", async ({ query, set }) => {
    if (query.key !== env("ADMIN_SECRET_KEY")) {
      set.status = 401;
      return { message: "Key tidak valid" };
    }

    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return users.map(toPublicUser);
  })

  // ── Register ──────────────────────────────────────────────────────────────
  .post(
    "/auth/register",
    async ({ body, jwt, set }) => {
      const exists = await prisma.user.findUnique({ where: { email: body.email } });
      if (exists) {
        set.status = 409;
        return { message: "Email sudah terdaftar" };
      }

      const user = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          passwordHash: await hashPassword(body.password),
          isGoogle: false
        }
      });

      return { ...toPublicUser(user), token: await jwt.sign({ sub: user.id }) };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 })
      })
    }
  )

  // ── Login Email ───────────────────────────────────────────────────────────
  .post(
    "/auth/login",
    async ({ body, jwt, set }) => {
      const user = await prisma.user.findUnique({ where: { email: body.email } });
      const valid = await verifyPassword(body.password, user?.passwordHash ?? null);
      if (!user || !valid) {
        set.status = 401;
        return { message: "Email atau password salah" };
      }

      return { ...toPublicUser(user), token: await jwt.sign({ sub: user.id }) };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 })
      })
    }
  )

  // ── Login Google OAuth ────────────────────────────────────────────────────
  .post(
    "/auth/google",
    async ({ body, jwt, set }) => {
      try {
        const googleData = await verifyGoogleToken(body.token);

        // Cari user berdasarkan googleId dulu, fallback ke email
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { googleId: googleData.sub },
              { email: googleData.email, isGoogle: true }
            ]
          }
        });

        if (!user) {
          // Cek apakah email sudah dipakai akun email biasa
          const emailConflict = await prisma.user.findUnique({
            where: { email: googleData.email }
          });
          if (emailConflict) {
            // Merge: update akun lama dengan googleId
            user = await prisma.user.update({
              where: { id: emailConflict.id },
              data: {
                googleId: googleData.sub,
                isGoogle: true,
                avatarUrl: emailConflict.avatarUrl ?? googleData.picture ?? null
              }
            });
          } else {
            // Buat akun baru
            user = await prisma.user.create({
              data: {
                name: googleData.name,
                email: googleData.email,
                isGoogle: true,
                googleId: googleData.sub,
                avatarUrl: googleData.picture ?? null
              }
            });
          }
        } else {
          // Update avatar jika belum punya
          if (!user.avatarUrl && googleData.picture) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { avatarUrl: googleData.picture }
            });
          }
        }

        return { ...toPublicUser(user), token: await jwt.sign({ sub: user.id }) };
      } catch (err) {
        set.status = 401;
        return { message: err instanceof Error ? err.message : "Google login gagal" };
      }
    },
    {
      body: t.Object({
        token: t.String({ minLength: 1 })
      })
    }
  )

  // ── Me ────────────────────────────────────────────────────────────────────
  .get("/me", async ({ userId }) => toPublicUser(await requireUser(prisma, userId)))
  .patch(
    "/me",
    async ({ body, userId }) => {
      const user = await requireUser(prisma, userId);
      const data: { name?: string; email?: string; avatarUrl?: string | null; passwordHash?: string } = {};

      if (body.name !== undefined) data.name = body.name;
      if (body.email !== undefined) data.email = body.email;
      if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl;
      if (body.password !== undefined) data.passwordHash = await hashPassword(body.password);

      const updated = await prisma.user.update({ where: { id: user.id }, data });
      return toPublicUser(updated);
    },
    {
      body: t.Object({
        name: t.Optional(t.String({ minLength: 2 })),
        email: t.Optional(t.String({ format: "email" })),
        avatarUrl: t.Optional(t.Nullable(t.String())),
        password: t.Optional(t.String({ minLength: 8 }))
      })
    }
  )

  // ── Posts ─────────────────────────────────────────────────────────────────
  .get("/posts", async ({ userId }) => {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        likes: true,
        comments: true
      }
    });

    return posts.map((post) => ({
      id: post.id,
      text: post.text,
      imageUrl: post.imageUrl,
      author: toPublicUser(post.author),
      likeCount: post.likes.length,
      commentCount: post.comments.length,
      likedByMe: userId ? post.likes.some((like) => like.userId === userId) : false,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
  })
  .post(
    "/posts",
    async ({ body, userId, set }) => {
      const user = await requireUser(prisma, userId);
      const count = await prisma.post.count({ where: { authorId: user.id } });
      if (count >= LIMITS.maxPostsPerUser) {
        set.status = 403;
        return { message: "Satu user hanya boleh membuat 2 postingan" };
      }
      if (!isNonEmptyText(body.text)) {
        set.status = 400;
        return { message: "Text postingan wajib diisi" };
      }

      try {
        validateImageUrl(body.imageUrl);
      } catch (err) {
        set.status = 400;
        return { message: err instanceof Error ? err.message : "URL gambar tidak valid" };
      }

      return prisma.post.create({
        data: {
          text: body.text.trim(),
          imageUrl: body.imageUrl ?? null,
          authorId: user.id
        }
      });
    },
    {
      body: t.Object({
        text: t.String({ maxLength: LIMITS.maxPostTextLength }),
        imageUrl: t.Optional(t.Nullable(t.String()))
      })
    }
  )
  .get("/posts/:id", async ({ params, userId, set }) => {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: true,
        likes: true,
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: true }
        }
      }
    });
    if (!post) {
      set.status = 404;
      return { message: "Postingan tidak ditemukan" };
    }

    const comments: CommentItem[] = post.comments.map((comment) => ({
      id: comment.id,
      text: comment.text,
      author: toPublicUser(comment.author),
      createdAt: comment.createdAt.toISOString()
    }));

    return {
      id: post.id,
      text: post.text,
      imageUrl: post.imageUrl,
      author: toPublicUser(post.author),
      likeCount: post.likes.length,
      commentCount: post.comments.length,
      likedByMe: userId ? post.likes.some((like) => like.userId === userId) : false,
      comments,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  })
  .patch(
    "/posts/:id",
    async ({ params, body, userId, set }) => {
      const user = await requireUser(prisma, userId);
      const post = await prisma.post.findUnique({ where: { id: params.id } });
      if (!post) {
        set.status = 404;
        return { message: "Postingan tidak ditemukan" };
      }
      if (post.authorId !== user.id) {
        set.status = 403;
        return { message: "Hanya pemilik postingan yang bisa mengedit" };
      }

      try {
        validateImageUrl(body.imageUrl);
      } catch (err) {
        set.status = 400;
        return { message: err instanceof Error ? err.message : "URL gambar tidak valid" };
      }

      return prisma.post.update({
        where: { id: post.id },
        data: { text: body.text.trim(), imageUrl: body.imageUrl ?? null }
      });
    },
    {
      body: t.Object({
        text: t.String({ minLength: 1, maxLength: LIMITS.maxPostTextLength }),
        imageUrl: t.Optional(t.Nullable(t.String()))
      })
    }
  )
  .delete("/posts/:id", async ({ params, userId, set }) => {
    const user = await requireUser(prisma, userId);
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) {
      set.status = 404;
      return { message: "Postingan tidak ditemukan" };
    }
    if (post.authorId !== user.id) {
      set.status = 403;
      return { message: "Hanya pemilik postingan yang bisa menghapus" };
    }
    await prisma.post.delete({ where: { id: post.id } });
    return { ok: true };
  })

  // ── Likes ─────────────────────────────────────────────────────────────────
  .post("/posts/:id/like", async ({ params, userId, set }) => {
    const user = await requireUser(prisma, userId);
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) {
      set.status = 404;
      return { message: "Postingan tidak ditemukan" };
    }

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId: post.id, userId: user.id } }
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return { liked: false };
    }

    await prisma.like.create({ data: { postId: post.id, userId: user.id } });
    if (post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          actorId: user.id,
          postId: post.id,
          type: "LIKE",
          message: `${user.name} menyukai postingan kamu`
        }
      });
    }
    return { liked: true };
  })

  // ── Comments ──────────────────────────────────────────────────────────────
  .post(
    "/posts/:id/comments",
    async ({ params, body, userId, set }) => {
      const user = await requireUser(prisma, userId);
      const totalComments = await prisma.comment.count({ where: { authorId: user.id } });
      if (totalComments >= LIMITS.maxCommentsPerUser) {
        set.status = 403;
        return { message: "Satu user hanya boleh memberi 5 komentar" };
      }

      const post = await prisma.post.findUnique({ where: { id: params.id } });
      if (!post) {
        set.status = 404;
        return { message: "Postingan tidak ditemukan" };
      }

      const comment = await prisma.comment.create({
        data: {
          text: body.text.trim(),
          postId: post.id,
          authorId: user.id
        },
        include: { author: true }
      });

      if (post.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            recipientId: post.authorId,
            actorId: user.id,
            postId: post.id,
            commentId: comment.id,
            type: "COMMENT",
            message: `${user.name} mengomentari postingan kamu`
          }
        });
      }

      return {
        id: comment.id,
        text: comment.text,
        author: toPublicUser(comment.author),
        createdAt: comment.createdAt.toISOString()
      };
    },
    {
      body: t.Object({
        text: t.String({ minLength: 1, maxLength: LIMITS.maxCommentTextLength })
      })
    }
  )
  .get("/comments", async () => {
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: true, post: true }
    });

    return comments.map((comment) => ({
      id: comment.id,
      text: comment.text,
      postId: comment.postId,
      postText: comment.post.text,
      author: toPublicUser(comment.author),
      createdAt: comment.createdAt.toISOString()
    }));
  })

  // ── Notifications ─────────────────────────────────────────────────────────
  .get("/notifications", async ({ userId }) => {
    const user = await requireUser(prisma, userId);
    const notifications = await prisma.notification.findMany({
      where: { recipientId: user.id },
      orderBy: { createdAt: "desc" }
    });
    return notifications.map((item) => ({
      id: item.id,
      type: item.type,
      message: item.message,
      readAt: item.readAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString()
    }));
  })
  .patch("/notifications/:id/read", async ({ params, userId, set }) => {
    const user = await requireUser(prisma, userId);
    const notification = await prisma.notification.findFirst({
      where: { id: params.id, recipientId: user.id }
    });
    if (!notification) {
      set.status = 404;
      return { message: "Notifikasi tidak ditemukan" };
    }
    return prisma.notification.update({
      where: { id: notification.id },
      data: { readAt: new Date() }
    });
  });
