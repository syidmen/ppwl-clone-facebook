# Anggota 1 - Admin/Integrator

## Tujuan

Menjaga project tetap stabil saat semua anggota bekerja paralel. Anggota 1 tidak mengambil fitur besar seperti auth, feed, comment, atau notification. Fokusnya adalah integrasi, review, dan menjaga kontrak agar tidak berubah sembarangan.

## Ownership File

- `README.md`
- `docs/team/`
- Review-only untuk `apps/api/prisma/schema.prisma`
- Review-only untuk `packages/shared/src/index.ts`
- File route/app utama saat integrasi akhir, misalnya `apps/web/src/App.tsx` dan `apps/api/src/app.ts`

## Tugas Detail

1. Menjaga schema tetap fixed sesuai `panduan.md` dan ERD awal.
2. Menolak PR yang mengubah `schema.prisma` tanpa alasan sangat kuat.
3. Menolak PR yang mengubah file anggota lain tanpa koordinasi.
4. Merge PR anggota 2 sampai 6 secara bertahap.
5. Menyelesaikan konflik import, route registration, dan wiring akhir.
6. Memastikan semua halaman utama terhubung:
   - Login/Register.
   - Beranda.
   - Form Postingan.
   - Detail Postingan.
   - Notifikasi.
   - Edit Profile.
7. Menjalankan validasi akhir:
   - `bun run typecheck`
   - `bun run build`
   - test manual endpoint dan halaman.
8. Membuat issue jika ada kendala yang perlu dibahas dosen/asisten.

## Yang Tidak Dikerjakan Anggota 1

- Tidak membuat fitur auth secara detail.
- Tidak membuat feed/post/like.
- Tidak membuat comment.
- Tidak membuat notification.
- Tidak mengerjakan AWS/deploy di tahap ini.

## Checklist Selesai

- Semua PR fitur sudah direview.
- Tidak ada konflik ownership file.
- Schema tetap sesuai panduan.
- `bun run typecheck` berhasil setelah semua merge.
- `bun run build` berhasil setelah semua merge.
