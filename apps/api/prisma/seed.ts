import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

// Gunakan PrismaClient standar (tanpa driver adapter), sesuai db.ts
const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Mulai seeding database...")

  // Hapus data lama agar tidak bentrok saat seed dijalankan ulang
  // Urutan delete penting: dari yang paling banyak relasi ke yang paling sedikit
  await prisma.notification.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.postLike.deleteMany()
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()

  // ─── Users ────────────────────────────────────────────────────────────────
  // Schema field: passwordHash (bukan password), avatarUrl (bukan avatar_url),
  // providerId (bukan provider_id), provider: AuthProvider enum (EMAIL / GOOGLE)

  const hashedPassword = await bcrypt.hash("password123", 10)

  // User 1: Login via email biasa
  const user1 = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      username: "budi_s",
      email: "budi@test.com",
      passwordHash: hashedPassword,
      avatarUrl: "https://i.pravatar.cc/150?img=1",
      provider: "EMAIL", // AuthProvider enum: EMAIL | GOOGLE
      providerId: null,
    },
  })

  // User 2: Login via email biasa
  const user2 = await prisma.user.create({
    data: {
      name: "Siti Rahayu",
      username: "siti_r",
      email: "siti@test.com",
      passwordHash: hashedPassword,
      avatarUrl: "https://i.pravatar.cc/150?img=5",
      provider: "EMAIL",
      providerId: null,
    },
  })

  // User 3: Login via Google OAuth (passwordHash NULL)
  const user3 = await prisma.user.create({
    data: {
      name: "Ahmad Fauzi",
      username: "ahmad_f",
      email: "ahmad@test.com",
      passwordHash: null,          // NULL karena OAuth-only
      avatarUrl: "https://i.pravatar.cc/150?img=3",
      provider: "GOOGLE",          // AuthProvider enum: GOOGLE
      providerId: "google_oauth_id_12345",
    },
  })

  console.log("✅ Users selesai dibuat")

  // ─── Posts ────────────────────────────────────────────────────────────────
  // Schema field: userId (bukan user_id), imageUrl (bukan image_url)

  const post1 = await prisma.post.create({
    data: {
      userId: user1.id,
      content: "Hari pertama coding pakai ElysiaJS, ternyata cepet banget! ⚡",
      imageUrl: "https://picsum.photos/seed/post1/600/400",
    },
  })

  const post2 = await prisma.post.create({
    data: {
      userId: user2.id,
      content: "Sunset sore ini di Bandung, cantik banget 🌅",
      imageUrl: "https://picsum.photos/seed/post2/600/400",
    },
  })

  const post3 = await prisma.post.create({
    data: {
      userId: user3.id,
      content: "Tips belajar React: mulai dari yang kecil, build terus sampai terbiasa 💪",
    },
  })

  console.log("✅ Posts selesai dibuat")

  // ─── Comments ─────────────────────────────────────────────────────────────
  // Schema field: postId (bukan post_id), userId (bukan user_id)

  const comment1 = await prisma.comment.create({
    data: {
      postId: post1.id,
      userId: user2.id,
      content: "Wah beneran? Harus coba nih!",
    },
  })

  const comment2 = await prisma.comment.create({
    data: {
      postId: post1.id,
      userId: user3.id,
      content: "ElysiaJS emang mantap, performanya top 🔥",
    },
  })

  await prisma.comment.create({
    data: {
      postId: post2.id,
      userId: user1.id,
      content: "Indah banget! Kapan ke sana lagi?",
    },
  })

  console.log("✅ Comments selesai dibuat")

  // ─── PostLikes ────────────────────────────────────────────────────────────
  // Schema field: postId (bukan post_id), userId (bukan user_id)

  await prisma.postLike.createMany({
    data: [
      { postId: post1.id, userId: user2.id },
      { postId: post1.id, userId: user3.id },
      { postId: post2.id, userId: user1.id },
      { postId: post3.id, userId: user1.id },
      { postId: post3.id, userId: user2.id },
    ],
  })

  console.log("✅ Likes selesai dibuat")

  // ─── Notifications ────────────────────────────────────────────────────────
  // Schema field: userId, actorId, postId, commentId, isRead (semua camelCase)
  // type: NotificationType enum → LIKE | COMMENT
  // message: String (wajib diisi, tidak ada di seed lama!)

  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,       // Penerima: Budi (pemilik post1)
        actorId: user2.id,      // Pemicu: Siti (yang komen)
        type: "COMMENT",        // NotificationType enum: COMMENT
        postId: post1.id,
        commentId: comment1.id,
        message: "Siti Rahayu mengomentari postingan kamu",
        isRead: false,
      },
      {
        userId: user1.id,       // Penerima: Budi
        actorId: user3.id,      // Pemicu: Ahmad (yang komen)
        type: "COMMENT",
        postId: post1.id,
        commentId: comment2.id,
        message: "Ahmad Fauzi mengomentari postingan kamu",
        isRead: false,
      },
      {
        userId: user1.id,       // Penerima: Budi
        actorId: user2.id,      // Pemicu: Siti (yang like)
        type: "LIKE",           // NotificationType enum: LIKE
        postId: post1.id,
        commentId: null,
        message: "Siti Rahayu menyukai postingan kamu",
        isRead: true,
      },
      {
        userId: user2.id,       // Penerima: Siti
        actorId: user1.id,      // Pemicu: Budi (yang like)
        type: "LIKE",
        postId: post2.id,
        commentId: null,
        message: "Budi Santoso menyukai postingan kamu",
        isRead: false,
      },
    ],
  })

  console.log("✅ Notifications selesai dibuat")
  console.log("")
  console.log("🎉 Seeding selesai! Data yang dibuat:")
  console.log("   👤 3 Users (budi_s, siti_r, ahmad_f) — password: password123")
  console.log("   📝 3 Posts")
  console.log("   💬 3 Comments")
  console.log("   ❤️  5 Likes")
  console.log("   🔔 4 Notifications")
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
