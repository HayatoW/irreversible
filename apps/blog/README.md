# Irreversible Blog

The blog uses the Void pages router with React. The Fate playground uses Drizzle, `void-fate`, `react-fate`, and Better Auth.

Public articles are Markdown files in `pages/blog/`. Their filenames are their URL slugs, so renaming a file changes its public URL. The playground lives at `/playground`.

## Folder Structure

- `pages/` - Void page routes.
- `routes/` - API routes, including fate RPC and live SSE routes.
- `src/` - Shared application, fate, UI, and auth code.
- `db/` - Drizzle schema, migrations, queries, and seed data.

## Initial Setup

You'll need Node.js 24.22+ on the 24.x line or Node.js 26.12+, and [Vite+](https://viteplus.dev/guide/).

Install dependencies from the monorepo root:

```bash
vp install --frozen-lockfile
```

Generate Void, Fate, and translation files from the monorepo root. This does not touch the database:

```bash
vp run blog#codegen
```

Start the app:

```bash
vp run dev:blog
```

The app runs at `http://localhost:6001`. Fate RPC requests go to `/fate`; live updates use the SSE route at `/fate-live`.

To populate a **disposable local database** for the playground, explicitly run `vp run blog#db:seed`. The command resets the local database, deleting any posts or comments already in it. Production migrations create only schema, not demo records.

If you already ran the previous demo migration in a local database, you can keep using it without resetting. Its existing data is unchanged.

## Development

Common commands from `apps/blog`:

- `vp run dev` starts the Void app.
- `vp run codegen` prepares Void, Fate, and translation artifacts without seeding.
- `vp run prepare:void` regenerates Void local files.
- `vp run fate:generate` refreshes fate client support after changing `src/fate/server.ts` or views.
- `vp run db:generate` generates Drizzle migration files from `db/schema.ts`.
- `vp run db:migrate` applies database migrations.
- `vp run db:seed` resets and seeds the local database.
- `vp check --fix` formats, lints, and type-checks the workspace.
- `vp run test` runs the test suite.
- `vp run build` builds the app.

## Cloudflare Deployment

The root production workflow still deploys `apps/website` only. It does not publish these routes or cut over the portfolio domain.

Fresh databases have no playground accounts, and the app has no registration screen. Decide how accounts should be provisioned before exposing the playground in production.

To deploy the blog separately, generate the app files and deploy from `apps/blog`:

```sh
vp run codegen
vp exec void deploy --platform cloudflare
```

Void signs you into Cloudflare when needed, provisions resources, applies the checked-in database migrations, and deploys the app. Commit the resource IDs saved in `void.lock.json` for subsequent deployments. Keep the template's `VOID_LIVE` Durable Object binding and class migration in `void.config.ts` for live updates.

After changing the database schema or auth configuration, run `vp run db:generate`, review and commit the migration, then deploy. The template's migrations include the production Better Auth schema.

## Translations

The React app uses fbtee 6 with its native Oxc Vite plugin and CLI. Setup and builds generate the runtime translation files automatically.

- Wrap UI text in `<fbt desc="Translator context">Text</fbt>`; use `fbs('Text', 'Translator context')` from `fbtee` for string attributes such as placeholders.
- Run `vp run fbtee:collect` in the app root to extract strings, then `vp run fbtee:prepare` to update the editable German and Japanese files in `translations/`.
- Translate entries marked `"status": "new"`, remove that status when finished, and run `vp run fbtee:translate` (or `vp run fbtee:all`). Commit `translations/`; runtime files in `src/translations/` are generated and ignored.
- Add locales to `src/lib/AvailableLanguages.tsx` and the `fbtee:prepare` script. The language selector remembers the choice. Server rendering starts in English and restores the browser preference after hydration.
