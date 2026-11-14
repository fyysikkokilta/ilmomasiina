# Commands

- `pnpm -w format`: Format all files in the repository using oxfmt.
- `pnpm -w typecheck`: Run TypeScript type checking for the entire repository.
  - `pnpm --filter @tietokilta/ilmomasiina-backend typecheck`: Run type checking only for the backend (if you only modified the backend package).
- `pnpm -w test`: Run tests for all packages in the repository using Vitest.
  - `pnpm --filter @tietokilta/ilmomasiina-backend test`: Run tests only for the backend.
- `pnpm -w lint`: Lint all files in the repository using oxlint, with type-aware rules.
  - There is no per-package lint command, but `pnpm exec oxlint <path>` lints a single path.
- `pnpm -w format:check`: Check formatting without changing files.
- `pnpm -w clean`: Clean build artifacts from all packages in the repository.

# Code style

- Use strict TypeScript typing wherever possible.
  - Avoid using `any` whenever possible, unless the value is not really used and writing out the type is complex.
  - Prefer type guards (`instanceof`, `typeof`, schema validation) over `as` casts; oxlint flags unsafe type
    assertions. Use `toApiError()` from the client package for caught errors.
- Always use oxfmt to format code. Run `pnpm -w format` before committing changes.
- Always run oxlint and fix all errors before committing changes. Warnings may be suppressed with an
  `oxlint-disable-next-line <rule> -- <reason>` comment when there is a good reason.
- A pre-commit hook (lint-staged via simple-git-hooks) runs type checking, oxlint and oxfmt on staged files.
- Use comments to explain complex logic. Stay concise.
- Always import via either relative paths or package names. Paths starting with `src` fail after compilation.

# Project structure

- The project is an event signup system with upcoming support for payments.
- This is a monorepo managed structured as a pnpm workspace. It contains the following packages, under `packages/ilmomasiina-*`:
  - `@tietokilta/ilmomasiina-backend`: The backend server, running on Node.
  - `@tietokilta/ilmomasiina-frontend`: The frontend web application, built with React and Vite.
  - `@tietokilta/ilmomasiina-client`: Shared client library with API helpers, React hooks, and locale strings.
    - No UI components go in this package; those belong in the frontend. This package does not depend on an UI library, only React.
    - Locale strings and state management for the Events, SingleEvent and EditSignup routes belong here.
  - `@tietokilta/ilmomasiina-models`: Shared TypeScript types and JSON schemas for the API, built with Typebox.
- All UI strings belong in `packages/ilmomasiina-{frontend,client}/src/locales`, and are localized in Finnish and English.
- Email templates are in `packages/ilmomasiina-backend/src/emails`, also in Finnish and English.

See `docs/project-structure.md` for a more detailed breakdown.
