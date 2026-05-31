import { Elysia, t } from 'elysia';
import { prisma } from '../../db';
import { authMiddleware } from '../../middleware/auth.middleware';
import { createNotification } from '../notifications/notification.service';

export const commentsRoutes = new Elysia()
  // 1. Endpoint dummy/real untuk target dosen (GET /comments)
  .get('/comments', async () => {
    return await prisma.comment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
  })

  // 2. Ambil komentar untuk satu post (GET /posts/:id/comments)
  .get('/posts/:id/comments', async ({ params: { id } }) => {
    return await prisma.comment.findMany({
      where: { postId: id },
      include: {
        author: { select: { name: true, avatarUrl: true } } 
      },
      orderBy: { createdAt: 'asc' } 
    });
  })

  // 3. Tambah komentar (POST /posts/:id/comments) - Wajib Login
  .use(authMiddleware)
  .post('/posts/:id/comments', async ({ params: { id }, body, authUser, set }) => {
    if (!authUser) {
      set.status = 401;
      return { message: 'Unauthorized: silakan login terlebih dahulu' };
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, userId: true }
    });

    if (!post) {
      set.status = 404;
      return { message: 'Post tidak ditemukan' };
    }
    
    // Validasi maksimal 5 komentar per user
    const commentCount = await prisma.comment.count({
      where: { userId: authUser.sub }
    });

    if (commentCount >= 5) {
      set.status = 400;
      return { message: 'Maksimal 5 komentar per user.' };
    }

    const newComment = await prisma.comment.create({
      data: {
        content: body.content,
        postId: id,
        userId: authUser.sub
      },
      include: {
        author: { select: { name: true, avatarUrl: true } }
      }
    });

    await createNotification(post.userId, authUser.sub, 'comment', id, newComment.id);

    return newComment;
  }, {
    body: t.Object({ content: t.String() })
  });
