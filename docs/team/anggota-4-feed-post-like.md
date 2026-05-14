# Anggota 4 - Feed, Post CRUD, Like

## Tujuan

Mengerjakan beranda, form postingan, CRUD postingan, like/unlike, dan dummy data post untuk target GET feed. Kerjakan mandiri di folder post/feed tanpa menunggu auth/comment/notif selesai.

## Ownership File

- `apps/api/src/modules/posts/`
- `apps/api/src/modules/likes/`
- `apps/web/src/pages/feed/`
- `apps/web/src/components/post/`
- `apps/web/src/api/posts.api.ts`

## Endpoint Yang Dikerjakan

1. `GET /posts`
   - public, user belum login boleh akses.
   - return post terbaru plus author, likeCount, commentCount.
2. `GET /posts/:id`
   - public, untuk detail postingan.
   - return data post utama.
3. `POST /posts`
   - wajib login.
   - validasi maksimal 2 post per user.
   - hanya content dan imageUrl, tidak ada video.
4. `PATCH /posts/:id`
   - wajib login.
   - hanya pemilik post.
5. `DELETE /posts/:id`
   - wajib login.
   - hanya pemilik post.
6. `POST /posts/:id/like`
   - wajib login.
   - toggle like/unlike.
   - unique like per user.

## UI Yang Dikerjakan

1. Feed page
   - list post.
   - empty state.
   - loading state.
   - error state.
2. Post card
   - author, content, image, createdAt.
   - jumlah like dan komentar.
   - tombol like.
3. Create/Edit post form
   - content textarea.
   - image URL input.
   - validasi video tidak boleh.

## Kerja Paralel

- Gunakan mock user/token lokal untuk test create/like jika auth belum siap.
- Gunakan mock `commentCount` jika module komentar belum siap.
- Jangan memanggil service notifikasi langsung; admin akan sambungkan jika diperlukan.

## Batasan Supaya Tidak Konflik

- Jangan membuat komentar UI.
- Jangan mengubah notification module.
- Jangan mengubah auth store.
- Jangan mengubah schema.

## Checklist Selesai

- Beranda bisa GET dari backend atau mock API lokal milik module posts.
- Ada dummy post untuk demo lokal.
- User belum login bisa melihat feed.
- UI punya state untuk belum login saat create/like.
- `bun run typecheck` berhasil.
