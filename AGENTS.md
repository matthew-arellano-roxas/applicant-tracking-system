# Project instructions

## Workspace layout and commands

- This repository is a pnpm workspace. Its packages are `apps/api`, `apps/web`, and `packages/*`; keep `pnpm-workspace.yaml` in sync when a workspace moves or is added.
- Run dependency and development commands from the repository root. Use `pnpm --filter @ats/api add <package>` or `pnpm --filter @ats/web add <package>` to add dependencies to one app. Use `-D` for build, lint, and development tools.
- Use the root `pnpm-lock.yaml` as the workspace lockfile. Do not run `npm install` inside an app or commit app-level `package-lock.json` changes for workspace dependencies.
- Build `@ats/shared-types` before starting or building apps; the root scripts already do this.
- Use `pnpm dev` to run both apps, `pnpm dev:api` or `pnpm dev:web` to run one app, and `pnpm build` to build all workspaces.
- Keep app-specific tooling and guidance inside its app unless it applies to the whole repository. Keep shared project conventions here at the root.
- Treat `node_modules`, `dist`, and other generated output as disposable generated files; do not edit or move their contents manually.

## Frontend conventions

- Use React Router in Data Mode for routing and route data APIs.
- Use `lucide-react` for icons.
- Use shadcn/ui components for prebuilt UI components; follow the existing component patterns and customize them as needed.
- Use Tailwind CSS for styling and prefer utility classes over introducing separate CSS when practical.
- Use Axios for HTTP requests from the web app; keep shared request configuration in a common client module instead of creating one-off clients in pages.
- Follow separation of concerns: keep components focused on rendering, group related state and handlers together, and extract reusable stateful behavior into custom hooks and reusable pure logic into utility modules. Split components when a component or file becomes difficult to follow; avoid unrelated logic bundled into one component.

## API conventions

- Follow the existing Express controller and route patterns.
- Use `asyncHandler` and `ApiError`; don't create custom error handlers.
- Use Prisma through the shared `prisma` client in `src/configs`.
- Don't add role check inside the service let middleware handle the checking of role
- Base API request and response shapes on the shared schema definitions and the HTTP examples in `apps/api/tests/http/`; add or update an HTTP example when changing an API endpoint.
