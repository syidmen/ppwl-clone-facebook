# PPWL Clone Facebook

Monorepo Bun + TypeScript untuk tugas besar PPWL: sosial media KW Facebook.

## Stack

- Frontend: Vite, React, Tailwind CSS
- Backend: ElysiaJS, Prisma ORM
- Shared: tipe dan utilitas bersama FE/BE
- Database: PostgreSQL, cocok untuk AWS RDS

## Struktur

```txt
apps/
  api/      Backend Elysia + Prisma
  web/      Frontend React + Vite + Tailwind
packages/
  shared/   Shared types, constants, validators sederhana
```

## Menjalankan Lokal

1. Install dependency:

```bash
bun install
```

2. Siapkan env backend:

```bash
cp apps/api/.env.example apps/api/.env
```

Isi `DATABASE_URL` PostgreSQL lokal/RDS.

3. Generate Prisma dan migrasi database:

```bash
bun run db:generate
bun run db:migrate
```

4. Jalankan FE dan BE:

```bash
bun run dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:3000`

## Fitur Yang Disiapkan

- Login/register email dan password
- Endpoint OAuth Google placeholder
- Endpoint test data user: `/users?key=your-secret-key`
- Beranda publik
- Postingan CRUD tanpa upload video
- Like dan komentar 1 level
- Notifikasi
- Edit profile: avatar, name, email, password
- User belum login dapat melihat beranda dan detail postingan
- User wajib login untuk membuat post, like, komentar, dan edit profile
- Batas keamanan: 1 user maksimal 2 postingan dan 5 komentar

## Target Sabtu

Perintah penting:

```bash
bun run db:migrate
bun run db:seed
bun --cwd apps/api run dev
bun --cwd apps/web run dev
```

Test endpoint:

```txt
GET http://localhost:3000/users?key=your-secret-key
GET http://localhost:3000/posts
GET http://localhost:3000/comments
GET http://localhost:3000/notifications
```

Login dummy hasil seed:

```txt
andi@example.com / password123
```

Catatan:

- Notifikasi komentar masuk ke pemilik postingan.
- Halaman notifikasi punya tombol refresh untuk trigger ulang request data.
- Popup selamat datang setelah login memakai Sonner.
- Database diagram ada di `docs/database-diagram.md`.
- Panduan deploy AWS ada di `docs/deploy-aws.md`.
- Kendala lokal yang ditemukan dicatat di `docs/known-issues.md`.

## Deploy

- Frontend: AWS S3 + CloudFront. Jika terkendala, gunakan domain/Vercel.
- Backend: AWS Elastic Beanstalk, ECS, atau EC2 dengan Bun runtime.
- Database production: AWS RDS PostgreSQL.

Link GDocs: https://docs.google.com/document/d/1LafthdqknsYzHoa55z76cWz1JJ2-zBVuNNtL7JxEIDw/edit?usp=sharing
