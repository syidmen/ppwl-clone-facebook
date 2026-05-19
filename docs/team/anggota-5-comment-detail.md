# Anggota 5 - Comment dan Detail Post

## Tujuan

Mengerjakan detail postingan dan komentar 1 level sesuai update rules. Komentar tidak wajib edit/hapus. Kerjakan mandiri tanpa menunggu feed final.

## Ownership File

- `apps/api/src/modules/comments/`
- `apps/web/src/pages/post-detail/`
- `apps/web/src/components/comment/`
- `apps/web/src/api/comments.api.ts`

## Endpoint Yang Dikerjakan

1. `GET /posts/:id/comments`
   - public.
   - return komentar untuk satu post.
   - urutkan komentar konsisten.
2. `POST /posts/:id/comments`
   - wajib login.
   - validasi maksimal 5 komentar per user.
   - komentar hanya 1 level, tidak ada reply.
3. `GET /comments`
   - endpoint target dosen untuk test GET komentar.
   - return dummy/real comments.

## UI Yang Dikerjakan

1. Detail post page
   - tampilkan content/gambar post memakai mock post jika endpoint post belum siap.
   - tampilkan list komentar.
   - form tambah komentar.
2. Comment list
   - author komentar.
   - isi komentar.
   - timestamp.
3. State UI
   - loading saat ambil komentar.
   - error state.
   - empty state.

## Kerja Paralel

- Gunakan mock post detail di page sendiri agar tidak menunggu Anggota 4.
- Auth backend dan auth store sudah tersedia dari Anggota 2. Untuk tambah komentar, gunakan `authMiddleware` di backend dan token dari `apps/web/src/stores/auth.store.ts` di frontend.
- Login/register/profile UI sudah tersedia dari Anggota 3. Jangan membuat ulang halaman auth.
- Mock user/token hanya dipakai sebagai fallback test lokal jika backend auth sedang tidak berjalan.
- Untuk notifikasi pemilik post, cukup expose event/function placeholder di module comment; admin akan sambungkan ke Anggota 6 saat integrasi.

## Integrasi Yang Sudah Bisa Dipakai

- Backend dapat membaca user login lewat Bearer token dan `authMiddleware`.
- Frontend dapat membaca `user`, `token`, dan `isAuthenticated` dari `useAuthStore`.
- User belum login tetap boleh melihat detail post dan komentar.
- Untuk `POST /posts/:id/comments`, kirim header `Authorization: Bearer <token>`.

## Batasan Supaya Tidak Konflik

- Jangan mengubah feed card milik Anggota 4.
- Jangan mengubah notification page milik Anggota 6.
- Jangan menambahkan reply komentar.
- Jangan mengubah schema.

## Checklist Selesai

- Detail post dapat memuat komentar dari endpoint/comment mock milik sendiri.
- User belum login bisa melihat komentar.
- UI punya state untuk belum login saat komentar.
- `GET /comments` tersedia untuk target dosen.
- `bun run typecheck` berhasil.
