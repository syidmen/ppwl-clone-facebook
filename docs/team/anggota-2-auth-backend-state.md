# Anggota 2 - Auth Backend dan Auth State

## Tujuan

Mengerjakan login/register email password, dasar Google OAuth backend, endpoint `/users?key=your-secret-key`, dan auth state global. Kerjakan mandiri memakai schema yang sudah fixed.

## Ownership File

- `apps/api/src/modules/auth/`
- `apps/api/src/modules/users/`
- `apps/api/src/middleware/auth.middleware.ts`
- `apps/api/src/utils/password.ts`
- `apps/api/src/utils/token.ts`
- `apps/web/src/stores/auth.store.ts`
- `apps/web/src/api/auth.api.ts`

## Endpoint Yang Dikerjakan

1. `POST /auth/register`
   - body: name, username, email, password.
   - validasi email unik dan username unik.
   - hash password dengan bcrypt.
   - simpan provider `EMAIL`.
   - return user dan access token.
2. `POST /auth/login`
   - body: email, password.
   - verifikasi password.
   - return user dan access token.
3. `POST /auth/google`
   - untuk tahap ini boleh placeholder yang menerima token string.
   - return response shape yang sama dengan login biasa.
4. `GET /me`
   - wajib Bearer token.
   - return user login.
5. `GET /users?key=your-secret-key`
   - endpoint target dosen untuk cek data user.
   - jangan return passwordHash.

## State Frontend

Buat `auth.store.ts` dengan Zustand:

- `user`
- `token`
- `isAuthenticated`
- `setAuth(user, token)`
- `logout()`
- persist ke localStorage.

## Kerja Paralel

- Tidak perlu menunggu UI Anggota 3. Test endpoint auth dengan curl/Postman/Thunder Client.
- Tidak perlu menunggu halaman profile. Cukup sediakan store dan API helper.
- Jangan mengubah schema. Ikuti field yang sudah ada di `schema.prisma`.

## Batasan Supaya Tidak Konflik

- Jangan membuat tampilan login/register.
- Jangan mengubah feed/post/comment/notif modules.
- Jangan mengubah `schema.prisma` atau shared global tanpa admin.

## Checklist Selesai

- Register berhasil menyimpan data ke database.
- Login berhasil menghasilkan token.
- `/users?key=your-secret-key` dapat diakses dan tidak membocorkan passwordHash.
- `GET /me` berhasil dengan token.
- `bun run typecheck` berhasil.
