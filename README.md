# Wedding

Next.js wedding invitation site with an admin page for album photos, background music, and visit logs.

## Local Development

```shell
cp .env.example .env
bun install
bun dev
```

The app uses PGlite instead of an external Postgres service. By default the embedded database is stored at `./data/pglite`; override it with `PGLITE_DATA_DIR`.

Album images and background music are served directly from `public`:

- photos: `public/album`
- music: `public/music`

The admin upload API writes files into those directories and stores their public paths in PGlite.

## Environment

Required:

- `ADMIN_PASSWORD`

Optional:

- `PGLITE_DATA_DIR` - defaults to `./data/pglite`
- `NEXT_PUBLIC_AMAP_KEY`
- `NEXT_PUBLIC_AMAP_SECURITY_JS_CODE`
- `MAXMIND_DB_PATH`

## Docker

```shell
docker build -t wedding .
docker run --rm -p 3000:3000 \
  -e ADMIN_PASSWORD=changeme \
  -e PGLITE_DATA_DIR=/app/data/pglite \
  -v "$PWD/data/pglite:/app/data/pglite" \
  -v "$PWD/public/album:/app/public/album" \
  -v "$PWD/public/music:/app/public/music" \
  wedding
```

## Deployment

`.github/workflows/deploy.yml` runs on pushes to `main`, builds the Docker image, pushes it to `ghcr.io`, then deploys it to the `cd` server at `8.137.169.225`.

Configure these GitHub secrets:

- `CD_SSH_PRIVATE_KEY`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_AMAP_KEY`
- `NEXT_PUBLIC_AMAP_SECURITY_JS_CODE`

Optional GitHub variable:

- `DEPLOY_PORT` - defaults to `3000` and binds to loopback for the Nginx reverse proxy
