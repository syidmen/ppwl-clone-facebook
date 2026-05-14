# Deploy AWS Target

## Frontend ke S3

1. Build frontend:

```bash
bun --filter @ppwl/web build
```

2. Upload folder `apps/web/dist` ke bucket S3 static website hosting.

3. Set environment saat build jika backend sudah online:

```bash
VITE_API_URL=https://api-domain-kamu.execute-api.ap-southeast-1.amazonaws.com bun --filter @ppwl/web build
```

## Backend ke Lambda

Backend sudah punya handler di `apps/api/src/lambda.ts`.

Build bundle Lambda:

```bash
bun --cwd apps/api run build:lambda
```

Entry hasil build:

```txt
apps/api/dist-lambda/lambda.js
```

Handler:

```txt
lambda.handler
```

Environment Lambda yang wajib:

```env
DATABASE_URL="postgresql://USER:PASSWORD@RDS-ENDPOINT:5432/DB_NAME?schema=public"
JWT_SECRET="secret-production"
ADMIN_SECRET_KEY="your-secret-key"
WEB_ORIGIN="https://domain-frontend-kamu"
```

Pastikan Lambda dapat akses RDS PostgreSQL lewat VPC/subnet/security group yang benar.
