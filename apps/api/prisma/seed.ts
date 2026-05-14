/**
 * Seed script: bun prisma/seed.ts
 * Membuat dummy data untuk testing GET posts, comments, dan notifications.
 * Password seed users: "password123" (bcrypt hash di bawah)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// bcrypt hash untuk "password123" dengan salt 12
const PLACEHOLDER_HASH = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgfl46.fQFCCuovHx.hWuO";

async function main() {
  console.log("🌱 Seeding dummy data...");

  // ── Users ──────────────────────────────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "budi@example.com" },
      update: {},
      create: {
        id: "seed-user-1",
        name: "Budi Santoso",
        email: "budi@example.com",
        passwordHash: PLACEHOLDER_HASH,
        isGoogle: false
      }
    }),
    prisma.user.upsert({
      where: { email: "siti@example.com" },
      update: {},
      create: {
        id: "seed-user-2",
        name: "Siti Rahayu",
        email: "siti@example.com",
        passwordHash: PLACEHOLDER_HASH,
        isGoogle: false
      }
    }),
    prisma.user.upsert({
      where: { email: "andi@example.com" },
      update: {},
      create: {
        id: "seed-user-3",
        name: "Andi Wijaya",
        email: "andi@example.com",
        passwordHash: PLACEHOLDER_HASH,
        isGoogle: false
      }
    })
  ]);

  console.log(`✅ ${users.length} users seeded`);

  // ── Posts ──────────────────────────────────────────────────────────────────
  const posts = await Promise.all([
    prisma.post.upsert({
      where: { id: "seed-post-1" },
      update: {},
      create: {
        id: "seed-post-1",
        authorId: "seed-user-1",
        text: "Halo semua! Ini postingan pertama saya di Facebook KW PPWL. Senang bisa bergabung di sini 🎉",
        imageUrl: null
      }
    }),
    prisma.post.upsert({
      where: { id: "seed-post-2" },
      update: {},
      create: {
        id: "seed-post-2",
        authorId: "seed-user-2",
        text: "Cuaca hari ini di Pontianak cerah sekali! Ada yang mau ngopi bareng?",
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600"
      }
    }),
    prisma.post.upsert({
      where: { id: "seed-post-3" },
      update: {},
      create: {
        id: "seed-post-3",
        authorId: "seed-user-3",
        text: "Baru selesai belajar ElysiaJS dan Prisma. Ternyata stack Bun + TypeScript sangat menyenangkan! 🚀",
        imageUrl: null
      }
    })
  ]);

  console.log(`✅ ${posts.length} posts seeded`);

  // ── Likes ──────────────────────────────────────────────────────────────────
  const likeData = [
    { id: "seed-like-1", postId: "seed-post-1", userId: "seed-user-2" },
    { id: "seed-like-2", postId: "seed-post-1", userId: "seed-user-3" },
    { id: "seed-like-3", postId: "seed-post-2", userId: "seed-user-1" },
    { id: "seed-like-4", postId: "seed-post-3", userId: "seed-user-1" },
    { id: "seed-like-5", postId: "seed-post-3", userId: "seed-user-2" }
  ];

  let likeCount = 0;
  for (const like of likeData) {
    await prisma.like
      .upsert({
        where: { postId_userId: { postId: like.postId, userId: like.userId } },
        update: {},
        create: like
      })
      .catch(() => null);
    likeCount++;
  }

  console.log(`✅ ${likeCount} likes seeded`);

  // ── Comments ───────────────────────────────────────────────────────────────
  const commentData = [
    { id: "seed-comment-1", postId: "seed-post-1", authorId: "seed-user-2", text: "Selamat datang Budi! Semoga betah ya 😊" },
    { id: "seed-comment-2", postId: "seed-post-1", authorId: "seed-user-3", text: "Ayo aktif posting di sini!" },
    { id: "seed-comment-3", postId: "seed-post-2", authorId: "seed-user-3", text: "Mau banget! Jam berapa dan di mana?" }
  ];

  let commentCount = 0;
  for (const comment of commentData) {
    await prisma.comment
      .upsert({
        where: { id: comment.id },
        update: {},
        create: comment
      })
      .catch(() => null);
    commentCount++;
  }

  console.log(`✅ ${commentCount} comments seeded`);

  // ── Notifications ──────────────────────────────────────────────────────────
  const notifData = [
    {
      id: "seed-notif-1",
      recipientId: "seed-user-1",
      actorId: "seed-user-2",
      postId: "seed-post-1",
      type: "LIKE" as const,
      message: "Siti Rahayu menyukai postingan kamu"
    },
    {
      id: "seed-notif-2",
      recipientId: "seed-user-1",
      actorId: "seed-user-2",
      postId: "seed-post-1",
      commentId: "seed-comment-1",
      type: "COMMENT" as const,
      message: "Siti Rahayu mengomentari postingan kamu"
    },
    {
      id: "seed-notif-3",
      recipientId: "seed-user-2",
      actorId: "seed-user-3",
      postId: "seed-post-2",
      commentId: "seed-comment-3",
      type: "COMMENT" as const,
      message: "Andi Wijaya mengomentari postingan kamu"
    }
  ];

  let notifCount = 0;
  for (const notif of notifData) {
    await prisma.notification
      .upsert({
        where: { id: notif.id },
        update: {},
        create: notif
      })
      .catch(() => null);
    notifCount++;
  }

  console.log(`✅ ${notifCount} notifications seeded`);
  console.log("🎉 Seed selesai!");
  console.log("\nLogin dengan:");
  console.log("  Email: budi@example.com | siti@example.com | andi@example.com");
  console.log("  Password: password123");
}

main()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
