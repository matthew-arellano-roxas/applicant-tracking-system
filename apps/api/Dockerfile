FROM node:22-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@11.7.0 --activate

WORKDIR /workspace

# Install from the monorepo root so pnpm can link workspace packages.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @ats/shared-types build
RUN pnpm --filter @ats/api exec prisma generate

EXPOSE 3000 5173
CMD ["pnpm", "--filter", "@ats/api", "dev:api"]
