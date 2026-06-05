# PPWL Social Media Monorepo

Setup awal monorepo Bun + TypeScript untuk tugas besar PPWL: aplikasi sosial media KW.

link Gdocs: https://docs.google.com/document/d/1LafthdqknsYzHoa55z76cWz1JJ2-zBVuNNtL7JxEIDw/edit?usp=sharing

Link Frontend: https://d1pjqlav14h8sb.cloudfront.net/

Link Backend: https://h3qxapyg5yku6ow5w5k2rmyp640bozqw.lambda-url.us-east-1.on.aws/

## Stack

- Frontend: Vite, React, Tailwind CSS
- Backend: ElysiaJS, Prisma ORM
- Shared: tipe bersama antara frontend dan backend
- Database lokal: SQLite via Prisma
- Database production target: PostgreSQL di AWS RDS

## Struktur

```txt
apps/
  api/      Backend Elysia + Prisma
  web/      Frontend React + Vite + Tailwind
packages/
  shared/   Shared DTO dan type contract
docs/
  team/     Pembagian tugas 6 anggota
```

## Setup Lokal

Install dependency:

```bash
bun install
```

Siapkan env local:

```bash
cp apps/api/.env.local.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Local backend memakai SQLite, jadi tidak perlu install PostgreSQL. Contoh `DATABASE_URL` local:

```env
DATABASE_URL="file:./dev.db"
```

Generate Prisma Client:

```bash
bun run db:generate
```

Buat/sinkronkan tabel SQLite local:

```bash
bun run db:push
```

Isi dummy data local agar feed, komentar, like, dan notifikasi tidak kosong:

```bash
bun run db:seed
```

Catatan:

- `apps/api/prisma/schema.prisma` dipakai untuk SQLite local.
- `apps/api/prisma/schema-pg.prisma` dipakai untuk PostgreSQL production/RDS.
- `db:generate`, `db:push`, `db:seed`, dan `db:studio` default ke SQLite local.
- Untuk production PostgreSQL, gunakan `bun run db:generate:pg` dan `bun run db:push:pg` dengan `POSTGRES_DATABASE_URL`.
- Untuk package Lambda production, jalankan `bun --filter @ppwl/api package:lambda:pg` supaya Prisma Client di-generate dari schema PostgreSQL sebelum dibundle.
- Jika `POSTGRES_DATABASE_URL` mengarah ke RDS/production, jangan jalankan `db:push:pg` tanpa koordinasi tim.

Jalankan development server:

```bash
bun run dev
```

Atau pisah terminal:

```bash
bun run dev:api
bun run dev:web
```

URL default:

- API: `http://localhost:3000`
- Web: `http://localhost:5173`

## Pembagian Tugas

Baca [docs/team/pembagian-tugas.md](docs/team/pembagian-tugas.md) terlebih dahulu. Setiap anggota punya file detail masing-masing:

- [Anggota 1 - Admin/Integrator](docs/team/anggota-1-admin-integrator.md)
- [Anggota 2 - Auth Backend dan State](docs/team/anggota-2-auth-backend-state.md)
- [Anggota 3 - Auth UI dan Profile UI](docs/team/anggota-3-auth-profile-ui.md)
- [Anggota 4 - Feed, Post, Like](docs/team/anggota-4-feed-post-like.md)
- [Anggota 5 - Comment dan Detail Post](docs/team/anggota-5-comment-detail.md)
- [Anggota 6 - Notification dan Layout](docs/team/anggota-6-notification-layout.md)
