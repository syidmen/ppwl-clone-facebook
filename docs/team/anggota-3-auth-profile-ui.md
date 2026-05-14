# Anggota 3 - Auth UI dan Profile UI

## Tujuan

Membuat halaman login, register, dan edit profile yang responsif mobile dan desktop. UI boleh memakai mock submit dulu agar tidak menunggu endpoint auth selesai.

## Ownership File

- `apps/web/src/pages/auth/`
- `apps/web/src/pages/profile/`
- `apps/web/src/components/auth/`
- `apps/web/src/components/profile/`
- `apps/web/src/api/profile.api.ts`

## Halaman Yang Dikerjakan

1. Login page
   - form email dan password.
   - tombol login Google secara UI.
   - error state jika gagal.
   - loading state saat submit.
2. Register page
   - form name, username, email, password, confirm password.
   - validasi sederhana di client.
   - tampilkan pesan sukses/gagal.
3. Edit Profile page
   - avatar URL.
   - name.
   - username.
   - email.
   - password baru opsional.
4. Auth guard visual
   - siapkan state tampilan untuk kondisi belum login.
   - wiring route final dilakukan admin saat integrasi.

## Kerja Paralel

- Tidak perlu menunggu Anggota 2. Buat adapter function/mock di file milik sendiri.
- Setelah auth store siap, admin akan menyambungkan final.
- Gunakan type lokal jika perlu; jangan mengubah shared contract.

## Batasan Supaya Tidak Konflik

- Jangan mengubah backend auth route.
- Jangan mengubah navbar/layout global.
- Jangan mengerjakan feed/post/comment UI.
- Jangan mengubah `apps/web/src/App.tsx` untuk routing final; cukup export page/component.

## Checklist Selesai

- Login page mobile dan desktop rapi.
- Register page mobile dan desktop rapi.
- Profile page mobile dan desktop rapi.
- Form punya loading, disabled state, dan error message.
- `bun run typecheck` berhasil.
