# Setup and Development

[Back to documentation](../README.md) · [Repository home](../../README.md)

## Prerequisites

- Node.js 22 or later
- pnpm (the Dockerfile uses pnpm 11.7.0)
- PostgreSQL and Redis for running the API locally, or Docker Desktop for the Compose setup

The API also integrates with Supabase, Groq, and SMTP. Use the example environment file as the source of truth for required API variables:

- [`apps/api/.env.example`](../../apps/api/.env.example)

Never put live credentials in documentation or commit them to the repository.

## Run locally

Install dependencies from the repository root:

```sh
pnpm install
```

Create `apps/api/.env` from the example file and provide values for your local database, Redis services, and any required integrations. On macOS/Linux:

```sh
cp apps/api/.env.example apps/api/.env
```

On Windows PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Start the services:

```sh
pnpm dev
```

The web app is available at `http://localhost:5173`; the API listens on the configured `PORT` (3000 by default). For a clean local database, apply the Prisma schema to your **development** database:

```sh
pnpm --filter @ats/api exec prisma db push
```

`pnpm dev:api` runs the API workspace's development command, which starts both the API and its worker. To run only the API process, use:

```sh
pnpm --filter @ats/api dev:api
```

Other useful root commands:

```sh
pnpm dev:web
pnpm build
pnpm lint
```

## Seed demo data

The seed creates demo logins and linked recruitment data. Set your own `SEED_PASSWORD` value in `apps/api/.env` (minimum 8 characters), then run the seed from the repository root:

```sh
pnpm --filter @ats/api exec prisma db seed --config prisma7.config.ts
```

The seeded demo usernames are:

| Role | Username |
| --- | --- |
| Administrator | `demo.admin@gmail.com` |
| Applicant | `demo.applicant@gmail.com` |
| HR | `demo.hr@gmail.com` |
| Dean | `demo.dean@gmail.com` |
| Department Head — Computer Studies | `demo.departmenthead.cs@gmail.com` |
| Department Head — Education | `demo.departmenthead.education@gmail.com` |
| Department Head — Business | `demo.departmenthead.business@gmail.com` |
| Employee — IT | `demo.employee.it@gmail.com` |
| Employee — Accounting | `demo.employee.accounting@gmail.com` |
| Employee — HR | `demo.employee.hr@gmail.com` |
| Employee — Library | `demo.employee.library@gmail.com` |

All seed accounts use the same configured password. The seed also creates 30 fictional applicant accounts (`candidate01@example.com` through `candidate30@example.com`) and associated hiring requests, job posts, applications, scores, interviews, and evaluations. It is repeatable and refuses to run when `NODE_ENV=production`. It creates application records, but does not upload CV files; the applicant demo account must upload a PDF before submitting another application.

Compose does not load `apps/api/.env`. It reads the project-root `.env` for `${...}` substitutions in [`docker-compose.yaml`](../../docker-compose.yaml). Set `SEED_PASSWORD` there, then run:

```sh
docker compose exec api pnpm --filter @ats/api exec prisma db seed --config prisma7.config.ts
```

Do not use demo accounts or the demo password in production.

## Run with Docker Compose

The Compose file includes the API, worker, web app, PostgreSQL, and Redis services. Compose automatically reads a project-root `.env` file and substitutes its values into `docker-compose.yaml`; it does not automatically pass every variable to containers. The Compose file passes the API credentials and service settings it uses. It deliberately uses `COMPOSE_DATABASE_URL` and `COMPOSE_REDIS_*_URL` for container connections, since `localhost` in the regular `DATABASE_URL` or `REDIS_*_URL` values refers to the current container, not the database or Redis service.

Copy [`.env.example`](../../.env.example) to `.env` if you do not already have a root `.env`, or merge the example variables into your existing file without overwriting its credentials. The example contains local-development defaults only. You can change the published host ports with `WEB_HOST_PORT`, `API_HOST_PORT`, `POSTGRES_HOST_PORT`, `REDIS_CACHE_HOST_PORT`, and `REDIS_QUEUE_HOST_PORT`; `API_UPSTREAM` controls the web container's Nginx proxy target. Set `COMPOSE_DATABASE_URL` or `COMPOSE_REDIS_CACHE_URL` / `COMPOSE_REDIS_QUEUE_URL` only when you need to override the Compose-internal defaults. If you change PostgreSQL credentials, keep the database URL in sync; URL-encode special characters in the URL or set `COMPOSE_DATABASE_URL` explicitly.

PostgreSQL's `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` initialize a new data volume; changing them later does not change credentials inside an existing volume.

Start the development stack from the repository root:

```sh
docker compose up --build
```

Open the web app at `http://localhost:5173` and the API at `http://localhost:3000` by default (or use the configured host ports). The web container proxies `/api` to `API_UPSTREAM`, which defaults to `http://api:3000` on the Compose network. The API service pushes the Prisma schema to the local Compose database at startup. PostgreSQL and Redis data are stored in named Docker volumes. Stop the services with:

```sh
docker compose down
```

Use the Compose service hostnames (`postgres`, `redis-cache`, and `redis-queue`) for service-to-service connections inside Docker. `localhost` inside a container refers to that container, not another Compose service.

Compose selects the Dockerfile's `development` target. The Dockerfile's default final target is the compiled `production` image; see [Architecture](../architecture/README.md) for the workspace and image overview.

## Environment and API behavior

Review [`apps/api/.env.example`](../../apps/api/.env.example) for the environment variable names used by the API, including database, Redis, SMTP, Groq, Supabase, JWT, and frontend origin settings. Use secure, unique values for secrets outside local development.

- Credentialed CORS requests are restricted to the origin in `FRONTEND_URL`.
- All API routes use a Redis-backed baseline rate limit of 1,000 requests per IP per 15 minutes. Authentication routes have stricter limits; OTP attempt limits also apply.
- If deployed behind a reverse proxy, configure `TRUST_PROXY_HOPS` to the exact number of trusted proxies. Do not trust forwarded IP headers from untrusted clients.

## Deployment notes

For Render web services, set the health check path to `/health`.

The checked-in Compose setup is for local development: it uses placeholder integration values and runs `prisma db push`. Do not deploy it as-is or use `db push` against a production database. A production deployment needs production secrets, HTTPS-aware cookie/CORS settings, managed or secured PostgreSQL and Redis, an appropriate trusted-proxy configuration, and a reviewed Prisma migration strategy.
