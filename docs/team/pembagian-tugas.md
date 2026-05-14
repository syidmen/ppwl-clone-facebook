# Pembagian Tugas Tim

Dokumen ini membagi pekerjaan 6 anggota agar semua bisa kerja paralel tanpa konflik file.

## Prinsip Paralel

1. `apps/api/prisma/schema.prisma` dianggap fixed dari panduan/ERD. Tidak ada anggota fitur yang mengubah schema.
2. `packages/shared/src/index.ts` dianggap **kontrak awal**. Jika perlu tambahan type, anggota membuat type lokal dulu di area masing-masing; admin boleh merapikan saat integrasi.
3. Tiap anggota hanya mengubah folder ownership masing-masing.
4. Tiap anggota boleh memakai mock data lokal supaya tidak menunggu endpoint anggota lain.
5. Integrasi lintas fitur hanya dilakukan oleh Admin/Integrator.
6. Branch format: `feat/nama-fitur`.

## Ringkasan Ownership

| Anggota | Fokus | Area File Utama |
| --- | --- | --- |
| 1 | Admin/Integrator, schema guard, merge owner | `README.md`, `docs/team/`, review `apps/api/prisma/schema.prisma`, review `packages/shared/` |
| 2 | Auth backend dan auth state | `apps/api/src/modules/auth/`, `apps/api/src/modules/users/`, `apps/api/src/middleware/`, `apps/web/src/stores/auth.store.ts` |
| 3 | Auth UI dan profile UI | `apps/web/src/pages/auth/`, `apps/web/src/pages/profile/`, `apps/web/src/components/auth/`, `apps/web/src/components/profile/` |
| 4 | Feed, post CRUD, like | `apps/api/src/modules/posts/`, `apps/api/src/modules/likes/`, `apps/web/src/pages/feed/`, `apps/web/src/components/post/` |
| 5 | Comment dan detail post | `apps/api/src/modules/comments/`, `apps/web/src/pages/post-detail/`, `apps/web/src/components/comment/` |
| 6 | Notification, navbar, UI shell | `apps/api/src/modules/notifications/`, `apps/web/src/pages/notifications/`, `apps/web/src/components/layout/`, `apps/web/src/components/navbar/` |

## Cara Agar Tidak Saling Menunggu

- Anggota 2 membuat auth backend dan auth store dengan mock token sementara jika database belum siap.
- Anggota 3 membuat UI auth/profile memakai mock submit dahulu, lalu admin sambungkan ke store/API saat integrasi.
- Anggota 4 membuat feed/post UI dengan mock posts dan endpoint posts sendiri.
- Anggota 5 membuat detail/comment UI dengan mock comments dan endpoint comments sendiri.
- Anggota 6 membuat navbar/notif UI dengan mock notification dan endpoint notifications sendiri.
- Admin melakukan wiring akhir antar halaman, route, navbar, auth guard, dan service notification setelah PR fitur masuk.


## Validasi Sebelum PR

Setiap anggota menjalankan:

```bash
bun run typecheck
```

Jika menyentuh build frontend/backend, jalankan juga:

```bash
bun run build
```
