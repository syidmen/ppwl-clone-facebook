-- Seed dummy data untuk testing GET posts & comments di FE
-- Jalankan setelah prisma migrate: bun prisma db seed
-- atau langsung via: psql $DATABASE_URL -f prisma/seed.sql

-- ── Users dummy ───────────────────────────────────────────────────────────────
INSERT INTO "User" (id, name, email, "passwordHash", "isGoogle", "avatarUrl", "createdAt", "updatedAt")
VALUES
  ('seed-user-1', 'Budi Santoso',   'budi@example.com',  '$2a$12$placeholderhashabcdefghijklmnopqrstuvwxyz12345', false, NULL, NOW(), NOW()),
  ('seed-user-2', 'Siti Rahayu',    'siti@example.com',  '$2a$12$placeholderhashabcdefghijklmnopqrstuvwxyz12345', false, NULL, NOW(), NOW()),
  ('seed-user-3', 'Andi Wijaya',    'andi@example.com',  '$2a$12$placeholderhashabcdefghijklmnopqrstuvwxyz12345', false, NULL, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ── Posts dummy ───────────────────────────────────────────────────────────────
INSERT INTO "Post" (id, "authorId", text, "imageUrl", "createdAt", "updatedAt")
VALUES
  (
    'seed-post-1',
    'seed-user-1',
    'Halo semua! Ini postingan pertama saya di Facebook KW PPWL. Senang bisa bergabung di sini 🎉',
    NULL,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'seed-post-2',
    'seed-user-2',
    'Cuaca hari ini di Pontianak cerah sekali! Ada yang mau ngopi bareng?',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
  ),
  (
    'seed-post-3',
    'seed-user-3',
    'Baru selesai belajar ElysiaJS dan Prisma. Ternyata stack Bun + TypeScript sangat menyenangkan! 🚀',
    NULL,
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Likes dummy ───────────────────────────────────────────────────────────────
INSERT INTO "Like" (id, "postId", "userId", "createdAt")
VALUES
  ('seed-like-1', 'seed-post-1', 'seed-user-2', NOW() - INTERVAL '90 minutes'),
  ('seed-like-2', 'seed-post-1', 'seed-user-3', NOW() - INTERVAL '80 minutes'),
  ('seed-like-3', 'seed-post-2', 'seed-user-1', NOW() - INTERVAL '50 minutes'),
  ('seed-like-4', 'seed-post-3', 'seed-user-1', NOW() - INTERVAL '20 minutes'),
  ('seed-like-5', 'seed-post-3', 'seed-user-2', NOW() - INTERVAL '15 minutes')
ON CONFLICT ("postId", "userId") DO NOTHING;

-- ── Comments dummy ────────────────────────────────────────────────────────────
INSERT INTO "Comment" (id, "postId", "authorId", text, "createdAt", "updatedAt")
VALUES
  (
    'seed-comment-1',
    'seed-post-1',
    'seed-user-2',
    'Selamat datang Budi! Semoga betah ya 😊',
    NOW() - INTERVAL '85 minutes',
    NOW() - INTERVAL '85 minutes'
  ),
  (
    'seed-comment-2',
    'seed-post-1',
    'seed-user-3',
    'Ayo aktif posting di sini!',
    NOW() - INTERVAL '75 minutes',
    NOW() - INTERVAL '75 minutes'
  ),
  (
    'seed-comment-3',
    'seed-post-2',
    'seed-user-3',
    'Mau banget! Jam berapa dan di mana?',
    NOW() - INTERVAL '45 minutes',
    NOW() - INTERVAL '45 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Notifications dummy ───────────────────────────────────────────────────────
INSERT INTO "Notification" (id, "recipientId", "actorId", "postId", "commentId", type, message, "readAt", "createdAt")
VALUES
  (
    'seed-notif-1',
    'seed-user-1',
    'seed-user-2',
    'seed-post-1',
    NULL,
    'LIKE',
    'Siti Rahayu menyukai postingan kamu',
    NULL,
    NOW() - INTERVAL '90 minutes'
  ),
  (
    'seed-notif-2',
    'seed-user-1',
    'seed-user-2',
    'seed-post-1',
    'seed-comment-1',
    'COMMENT',
    'Siti Rahayu mengomentari postingan kamu',
    NOW() - INTERVAL '80 minutes',
    NOW() - INTERVAL '85 minutes'
  ),
  (
    'seed-notif-3',
    'seed-user-2',
    'seed-user-3',
    'seed-post-2',
    'seed-comment-3',
    'COMMENT',
    'Andi Wijaya mengomentari postingan kamu',
    NULL,
    NOW() - INTERVAL '45 minutes'
  )
ON CONFLICT (id) DO NOTHING;
