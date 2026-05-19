# PPWL Social Media Monorepo

Setup awal monorepo Bun + TypeScript untuk tugas besar PPWL: aplikasi sosial media KW.

link Gdocs: https://docs.google.com/document/d/1LafthdqknsYzHoa55z76cWz1JJ2-zBVuNNtL7JxEIDw/edit?usp=sharing

Link Frontend: https://d1pjqlav14h8sb.cloudfront.net/

Link Backend: https://h3qxapyg5yku6ow5w5k2rmyp640bozqw.lambda-url.us-east-1.on.aws/

## Stack

- Frontend: Vite, React, Tailwind CSS
- Backend: ElysiaJS, Prisma ORM
- Shared: tipe bersama antara frontend dan backend
- Database lokal/production target: PostgreSQL

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

Siapkan env:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Generate Prisma Client:

```bash
bun run db:generate
```

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
