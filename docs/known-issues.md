# Known Issues

## Prisma migrate belum jalan di mesin lokal

Tanggal cek: 2026-05-14

`bun run db:migrate` gagal saat mencoba konek ke:

```txt
postgresql://localhost:5432/ppwl_clone_facebook
```

Kemungkinan PostgreSQL lokal belum running, database belum dibuat, atau credential di `apps/api/.env` belum sesuai.

Langkah resolve:

1. Pastikan PostgreSQL aktif.
2. Buat database `ppwl_clone_facebook`.
3. Cek username/password di `apps/api/.env`.
4. Jalankan ulang:

```bash
bun run db:migrate
bun run db:seed
```
