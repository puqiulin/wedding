# Cloudflare R2

Uploads use Cloudflare R2 through its S3-compatible API.

Use the environment-specific templates:

- `.env.local.example` for local development: Neon `preview` branch + R2 `wedding-dev`
- `.env.production.example` for Vercel production: Neon `prod` branch + R2 `wedding-prod`

# Deploy with Vercel + Neon

Use Vercel's Git integration for deployments. Configure these environment variables in the Vercel project.

Required Vercel environment variables:

- `DATABASE_URL` - Neon pooled connection string with `sslmode=require`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_R2_BASE_URL`
- `NEXT_PUBLIC_AMAP_KEY`
- `R2_ENDPOINT` or `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`

Optional Vercel environment variables:

- `NEXT_PUBLIC_AMAP_SECURITY_JS_CODE`
- `R2_REGION` - defaults to `auto`
- `R2_FORCE_PATH_STYLE`

Run Drizzle migrations against Neon before deploying schema changes:

```shell
DATABASE_URL='postgresql://...' bun run db:migrate
```

For local development:

```shell
cp .env.local.example .env
```

In Vercel, add the values from `.env.production.example` to the project environment variables.

Apply the R2 CORS policy after creating buckets:

```shell
npx wrangler r2 bucket cors set wedding-dev --file cloudflare/r2-cors.json --force
npx wrangler r2 bucket cors set wedding-prod --file cloudflare/r2-cors.json --force
```
