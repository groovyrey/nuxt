# Luface

Luface is a biometric identity infrastructure platform built with Nuxt. It provides hosted face enrollment and verification flows, API key management, audit logging, webhooks, and REST endpoints for applications that need face-based authentication.

## Features

- Face enrollment and verification through browser-based flows.
- Password and biometric login for dashboard users.
- Developer API keys for server-to-server integrations.
- Webhook configuration for identity events.
- Audit and usage tracking for operational visibility.
- Encrypted biometric descriptor storage with optional Milvus vector search.

## Tech Stack

- Nuxt 4 and Vue 3 for the web application.
- Nitro server routes under `server/api`.
- Turso/libSQL for persistence.
- `@vladmandic/face-api` for client-side face descriptors.
- Milvus for vector indexing when configured.
- Scalar for API documentation from `public/openapi.json`.

## Project Structure

```text
app/                 Nuxt pages, layouts, components, and composables
server/api/          Auth, API key, webhook, and v1 integration endpoints
server/utils/        Shared auth, database, encryption, usage, and vector helpers
server/plugins/      Server startup plugins
public/models/       Face-api model assets
public/openapi.json  API documentation spec
schema.sql           Database schema reference
```

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` with the required runtime values:

```bash
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
ENCRYPTION_KEY=
MILVUS_ADDRESS=
MILVUS_TOKEN=
```

`MILVUS_ADDRESS` and `MILVUS_TOKEN` are only required when vector search is enabled.

## Development

Start the local server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview a production build:

```bash
npm run preview
```

Generate static output where supported:

```bash
npm run generate
```

## Security Notes

Keep secrets in environment variables and never commit `.env.local`. Treat everything in `public/` as publicly accessible. Review authentication, rate limiting, API key handling, and webhook validation before deploying to production.
