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
- Gunakan mock user/token lokal untuk test tambah komentar jika auth belum siap.
- Untuk notifikasi pemilik post, cukup expose event/function placeholder di module comment; admin akan sambungkan ke Anggota 6 saat integrasi.

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
