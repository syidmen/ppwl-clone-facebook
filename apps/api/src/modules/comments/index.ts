import { Elysia, t } from 'elysia';
import prisma from '../../db';
import { authMiddleware } from '../../middleware/auth.middleware';

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
        author: { select: { name: true } } 
      },
      orderBy: { createdAt: 'asc' } 
    });
  })

  // 3. Tambah komentar (POST /posts/:id/comments) - Wajib Login
  .use(authMiddleware)
  .post('/posts/:id/comments', async ({ params: { id }, body, user, error }) => {
    
    // Validasi maksimal 5 komentar per user
    const commentCount = await prisma.comment.count({
      where: { postId: id, userId: user.id }
    });

    if (commentCount >= 5) {
      return error(400, "Maksimal 5 komentar per user untuk postingan ini.");
    }

    const newComment = await prisma.comment.create({
      data: {
        content: body.content,
        postId: id,
        userId: user.id
      }
    });

    // Expose event placeholder untuk Anggota 6 (Notification)
    console.log(`[Notification Placeholder] User ${user.id} mengomentari post ${id}`);

    return newComment;
  }, {
    body: t.Object({ content: t.String() })
  });