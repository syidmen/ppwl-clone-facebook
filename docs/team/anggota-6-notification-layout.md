# Anggota 6 - Notification, Navbar, UI Shell

## Tujuan

Mengerjakan notifikasi, navbar, layout dasar aplikasi, popup selamat datang setelah login, dan refresh notification.

## Ownership File

- `apps/api/src/modules/notifications/`
- `apps/web/src/pages/notifications/`
- `apps/web/src/components/layout/`
- `apps/web/src/components/navbar/`
- `apps/web/src/stores/notification.store.ts`
- `apps/web/src/stores/ui.store.ts`

## Endpoint Yang Dikerjakan

1. `GET /notifications`
   - wajib login.
   - return notifikasi milik user login.
2. `PATCH /notifications/:id/read`
   - wajib login.
   - tandai notifikasi sebagai dibaca.
3. Notification helper
   - siapkan fungsi helper untuk membuat notifikasi komentar/like.
   - helper boleh belum dipakai module lain sampai admin integrasi.

## UI Yang Dikerjakan

1. Navbar
   - logo/nama aplikasi.
   - menu beranda, notifikasi, profile.
   - avatar/nama user jika login memakai `apps/web/src/stores/auth.store.ts`.
   - badge unread notification.
2. Layout shell
   - responsif mobile dan desktop.
   - area main content.
   - mobile nav jika diperlukan.
3. Notification page
   - list notifikasi.
   - empty state.
   - loading state.
   - tombol/gesture refresh sederhana.
4. Popup awal login
   - pakai Sonner.
   - boleh trigger dari mock login state dulu.

## Kerja Paralel

- Auth backend dan auth store sudah tersedia dari Anggota 2. Gunakan `useAuthStore` untuk membaca user login, token, dan status login.
- Login/register/profile UI sudah tersedia dari Anggota 3. Navbar cukup menautkan/menampilkan akses ke halaman tersebut; jangan membuat ulang auth form.
- Gunakan mock notifications untuk UI jika endpoint belum siap.
- Export layout/navbar component; admin yang memasang ke `App.tsx` final.

## Integrasi Yang Sudah Bisa Dipakai

- Frontend dapat membaca `user`, `token`, `isAuthenticated`, dan `logout` dari `useAuthStore`.
- Backend endpoint notifikasi wajib login dapat memakai `authMiddleware` dan Bearer token.
- Popup selamat datang bisa dipicu saat `isAuthenticated` berubah menjadi `true`.
- Profile link dapat mengarah ke halaman profile yang sudah dibuat Anggota 3 saat admin memasang routing final.

## Batasan Supaya Tidak Konflik

- Jangan mengerjakan auth form.
- Jangan mengerjakan feed/post/comment UI utama.
- Jangan mengerjakan AWS/deploy.
- Jangan mengubah schema.

## Checklist Selesai

- Navbar tampil konsisten di mobile dan desktop.
- Notifikasi dummy/real tampil di halaman notifikasi.
- Popup selamat datang muncul dari state login/mock login.
- Refresh notification menjalankan request ulang.
- `bun run typecheck` berhasil.
