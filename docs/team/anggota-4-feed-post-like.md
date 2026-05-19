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

- Auth backend dan auth store sudah tersedia dari Anggota 2. Untuk endpoint wajib login, gunakan `authMiddleware` di backend dan token dari `apps/web/src/stores/auth.store.ts` di frontend.
- Login/register/profile UI sudah tersedia dari Anggota 3. Jangan membuat ulang halaman auth.
- Mock user/token hanya dipakai sebagai fallback test lokal jika backend auth sedang tidak berjalan.
- Gunakan mock `commentCount` jika module komentar belum siap.
- Jangan memanggil service notifikasi langsung; admin akan sambungkan jika diperlukan.

## Integrasi Yang Sudah Bisa Dipakai

- Backend dapat membaca user login lewat Bearer token dan `authMiddleware`.
- Frontend dapat membaca `user`, `token`, `isAuthenticated`, `setAuth`, dan `logout` dari `useAuthStore`.
- User belum login tetap boleh melihat `GET /posts`.
- Untuk `POST /posts`, `PATCH /posts/:id`, `DELETE /posts/:id`, dan `POST /posts/:id/like`, kirim header `Authorization: Bearer <token>`.

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
