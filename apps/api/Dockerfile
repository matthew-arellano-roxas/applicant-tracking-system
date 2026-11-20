FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@11.7.0 --activate

WORKDIR /workspace

FROM base AS workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @ats/shared-types build
RUN pnpm --filter @ats/api exec prisma generate

FROM workspace AS development

EXPOSE 3000
CMD ["pnpm", "--filter", "@ats/api", "dev:api"]

FROM workspace AS build

RUN pnpm --filter @ats/api build

FROM base AS production

ENV NODE_ENV=production

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json
COPY --from=build /workspace/apps/api/dist ./apps/api/dist
COPY --from=build /workspace/apps/api/src/generated/prisma ./apps/api/dist/generated/prisma
COPY --from=build /workspace/packages/shared-types/dist ./packages/shared-types/dist
RUN pnpm install --prod --frozen-lockfile --filter @ats/api...

EXPOSE 3000
CMD ["node", "apps/api/dist/start.js"]
