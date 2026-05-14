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
   - avatar/nama user jika login memakai mock auth state jika auth belum siap.
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

- Gunakan mock auth user jika Anggota 2 belum selesai.
- Gunakan mock notifications untuk UI jika endpoint belum siap.
- Export layout/navbar component; admin yang memasang ke `App.tsx` final.

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
