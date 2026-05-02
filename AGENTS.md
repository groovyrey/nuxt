# Repository Guidelines

## Project Structure & Module Organization

This is a Nuxt 4 application. Frontend code lives in `app/`: pages in `app/pages`, reusable Vue components in `app/components`, composables in `app/composables`, and shared layouts in `app/layouts`. Server endpoints are Nitro routes under `server/api`, with backend helpers in `server/utils` and plugins in `server/plugins`. Static assets are in `public`; face-api model files are stored in `public/models`, and the OpenAPI document is `public/openapi.json`. Unit tests currently sit beside server utilities as `*.test.ts`; end-to-end tests are in `tests/e2e`.

## Build, Test, and Development Commands

- `npm run dev`: start the Nuxt dev server on `http://localhost:3000`.
- `npm run build`: build the production app.
- `npm run generate`: generate a static build where supported.
- `npm run preview`: preview the built output locally.
- `npx vitest run`: run Node-based unit tests using `vitest.config.ts`.
- `npx playwright test`: run Chromium end-to-end tests; Playwright starts `npm run dev` automatically.

Run `npm install` after dependency changes so `package-lock.json` stays in sync.

## Coding Style & Naming Conventions

Use TypeScript, Vue single-file components, and Nuxt conventions. Prefer two-space indentation in Vue, TypeScript, JSON, and config files. Name Vue components in PascalCase, such as `FaceDetector.vue`, and composables as `useThing.ts`. Keep API route filenames aligned with HTTP behavior, for example `index.get.ts`, `register.post.ts`, and `[id].delete.ts`. Place shared backend logic in `server/utils` instead of duplicating it across routes.

## Testing Guidelines

Use Vitest for server utility tests and Playwright for browser workflows. Name unit tests `*.test.ts` next to the code they cover, as in `server/utils/auth.test.ts`. Name e2e specs `*.spec.ts` under `tests/e2e`. Add focused tests for authentication, API key behavior, database utilities, encryption, and user-visible flows when those areas change.

## Commit & Pull Request Guidelines

Recent history uses short, imperative or summary-style subjects such as `fix`, `Ui Refinement`, and `About Page`. Keep commit subjects concise, but prefer clearer descriptions like `Fix face login session handling`. Pull requests should include a short purpose statement, notable implementation details, test results, linked issues when applicable, and screenshots for UI changes.

## Security & Configuration Tips

Runtime secrets come from environment variables such as `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. Keep local secrets in `.env.local` and never commit them. Treat files under `public/` as publicly accessible; do not place credentials or private datasets there.
