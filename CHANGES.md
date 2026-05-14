# Perubahan Sesuai Panduan PPWL

## Ringkasan Target yang Dipenuhi

### ✅ Target #15

| Target | Status | Detail |
|--------|--------|--------|
| AWS Lambda & S3 ready | ✅ Sudah ada sebelumnya | `src/lambda.ts` & `dist-lambda/` |
| Registrasi & Login berhasil | ✅ | `/auth/register`, `/auth/login` |
| Data tersimpan di backend | ✅ | `/users?key=your-secret-key` |
| Beranda request dari backend | ✅ | `GET /posts` |
| Dummy data SQL untuk postingan | ✅ **BARU** | `prisma/seed.sql` & `prisma/seed.ts` |
| Test GET data tampil di FE | ✅ | 3 posts dummy siap |
| Komentar dummy data di SQL | ✅ **BARU** | 3 comments dummy |
| Notif dummy di backend | ✅ **BARU** | 3 notifications dummy |
| Notif popup selamat datang | ✅ | Sonner toast saat login |
| Skema database ready | ✅ | Prisma schema + ERD di docs/ |

---

## File yang Diubah/Ditambah

### Frontend (`apps/web/`)

#### `src/stores/auth.store.ts` ✨ BARU
- Zustand store dengan **`persist` middleware** sesuai panduan
- Menyimpan ke `localStorage` secara otomatis via Zustand (bukan manual)
- Shape: `{ user, token, isAuthenticated, setAuth, logout }`

#### `src/stores/notification.store.ts` ✨ BARU
- Zustand store untuk state notifikasi global
- `unreadCount` dipakai di navbar badge
- Sinkron antara navbar dan halaman notifikasi

#### `src/stores/ui.store.ts` ✨ BARU
- Zustand store untuk dark mode & sidebar state
- `theme` di-persist ke localStorage

#### `src/store.ts` 🔄 DIPERBARUI
- Sekarang jadi barrel re-export dari semua stores
- Backward compatibility terjaga

#### `src/main.tsx` 🔄 DIPERBARUI
- Ditambahkan **`GoogleOAuthProvider`** wrapper sesuai panduan
- Baca `VITE_GOOGLE_CLIENT_ID` dari env

#### `src/App.tsx` 🔄 DIPERBARUI
- Pakai `useAuthStore` dari stores/ (bukan store.ts lama)
- Pakai `useNotificationStore` untuk badge notifikasi
- **`ProtectedRoute`** component ditambahkan
- **Google OAuth login** UI via `@react-oauth/google`
- Notifikasi badge merah di navbar (unread count)
- Notifikasi unread ditandai berbeda (highlight biru)
- `markNotificationRead` tersedia di API

#### `src/api.ts` 🔄 DIPERBARUI
- Ditambahkan `loginGoogle(googleToken)` → `POST /auth/google`
- Ditambahkan `markNotificationRead(token, id)` → `PATCH /notifications/:id/read`
- `AuthResponse` type export

#### `package.json` 🔄 DIPERBARUI
- Ditambahkan `"@react-oauth/google": "^0.12.1"`

#### `.env.example` ✨ BARU
- Template env dengan `VITE_GOOGLE_CLIENT_ID`

---

### Backend (`apps/api/`)

#### `src/app.ts` 🔄 DIPERBARUI
- **`POST /auth/google`** sekarang **terimplementasi penuh** (bukan 501 placeholder)
  - Verifikasi Google ID token via `https://oauth2.googleapis.com/tokeninfo`
  - Handle merge akun (email konflik → update googleId)
  - Buat akun baru jika belum ada
  - Update avatar dari Google jika kosong

#### `prisma/seed.ts` ✨ BARU
- Script seed dengan Prisma client
- 3 users dummy (budi, siti, andi) — password: `password123`
- 3 posts dummy
- 5 likes dummy
- 3 comments dummy
- 3 notifications dummy

#### `prisma/seed.sql` ✨ BARU
- SQL mentah untuk run langsung via `psql`
- Sama seperti seed.ts tapi bisa dipakai tanpa bun

#### `package.json` 🔄 DIPERBARUI
- Ditambahkan field `"prisma": { "seed": "bun prisma/seed.ts" }`
- Tambah script `"db:seed"` dan `"db:studio"`

#### `.env.example` 🔄 DIPERBARUI
- Ditambahkan `GOOGLE_CLIENT_ID`

---

## Setup Google OAuth

1. Buka https://console.cloud.google.com
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Application type: **Web Application**
4. Authorized JavaScript origins: `http://localhost:5173`
5. Salin Client ID ke:
   - `apps/web/.env`: `VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com`
   - `apps/api/.env`: `GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com`

## Cara Jalankan Seed

```bash
# Masuk ke folder api
cd apps/api

# Pastikan database sudah running dan .env sudah diisi
# Jalankan migration dulu kalau belum
bun prisma migrate deploy

# Jalankan seed
bun run seed
# atau
bun prisma/seed.ts
```

## Arsitektur State Management

Sesuai rekomendasi panduan:

```
src/stores/
 ├── auth.store.ts          ← Wajib Zustand (user, token, isAuthenticated)
 ├── notification.store.ts  ← Wajib Zustand (badge navbar ↔ halaman notif)
 └── ui.store.ts            ← Opsional (theme, sidebar)
```

Server state (posts, comments, likes) tetap di React state lokal karena belum pakai TanStack Query.
