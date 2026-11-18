# Architecture

[Back to documentation](../README.md) · [Repository home](../../README.md)

## Technology

| Area | Technologies |
| --- | --- |
| Web app | React, TypeScript, Vite, React Router, Tailwind CSS, shadcn/ui, Zustand |
| API | Node.js, TypeScript, Express |
| Database | PostgreSQL with Prisma |
| Queue and rate-limit storage | Redis with BullMQ and `express-rate-limit` |
| Authentication and file storage | Supabase |
| Shared contracts and validation | `@ats/shared-types` and Zod |
| AI-assisted CV review | Groq integration |

## Workspace layout

```text
apps/
  api/                 Express API, worker, and Prisma schema
  web/                 React client
packages/
  shared-types/        Shared TypeScript types and validation schemas
docker-compose.yaml    Local development services
```

Run pnpm commands from the repository root. Add cross-application types and request schemas to `packages/shared-types`; apps consume them through the `@ats/shared-types` workspace package.

## Request and workflow overview

The web client calls the API for authentication, role-specific recruitment pages, and account data. The API persists application and hiring data in PostgreSQL through Prisma. Redis supports queued work and rate limiting. The worker handles background jobs. Supabase supplies authentication and storage integration; Groq is used for initial CV review.

The CV review is intended to assist human review. It does not replace authorized staff decisions.

## Role-based navigation

Authenticated routes are nested under the shared application layout. Route guards check both session status and the current user's role. The shared workspace page configuration supplies the menu label, route, allowed roles, and short page description. See the [page guide](../pages/README.md) for the route list.

## Docker images

The API Dockerfile contains separate development, build, and production stages. Compose explicitly selects the development target. The production target builds the API and shared package, generates Prisma assets, and runs the compiled API. The Compose setup is for local development; consult [Setup and development](../setup/README.md) before deploying.

## Object-oriented design concepts

| Principle | How the domain reflects it |
| --- | --- |
| Encapsulation | User, applicant, employee, and recruitment records group related data and behavior. |
| Inheritance | The project model describes shared user attributes across role-specific user types. |
| Polymorphism | Different roles perform actions appropriate to their responsibilities. |
| Abstraction | Role-based pages expose relevant actions without requiring users to interact with implementation details. |
