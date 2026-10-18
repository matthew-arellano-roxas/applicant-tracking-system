# Project instructions

- Follow the existing Express controller and route patterns.
- Use `asyncHandler` and `ApiError`; don't create custom error handlers.
- Use Prisma through the shared `prisma` client in `src/configs`.
- Don't add role check inside the service let middleware handle the checking of role
