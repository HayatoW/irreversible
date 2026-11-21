# Irreversible Blog

The blog uses the Void pages router with React. The post list is at `/posts`. Articles are Markdown files in `pages/posts/`; their filenames determine their public URLs.

## Local Development

Use Node.js 24.22+ on the 24.x line or Node.js 26.12+, and [Vite+](https://viteplus.dev/guide/). From the repository root:

```sh
vp install --frozen-lockfile
vp run dev:blog
```

Open `http://localhost:6001`. Run `vp run ready` from the repository root to generate Void types, check the workspace, and run tests and builds.

## Cloudflare Deployment

The root production workflow deploys only `apps/website`. To publish the blog to its separate `irreversible-blog` Worker, run from `apps/blog`:

```sh
vp exec void deploy --platform cloudflare
```

For CI, scope the Cloudflare API token to the account in `void.lock.json` and grant Workers Scripts: Edit and Workers KV Storage: Edit. The blog uses KV to cache Markdown pages; it does not use D1.

Retiring the playground's live-update Durable Object requires an atomic deployment. If Void still reports pending Durable Object migrations on a later deploy, review the listed tags and retry with:

```sh
vp exec void deploy --platform cloudflare --atomic
```

Cloudflare switches traffic before Void checks readiness in this mode. If the command fails after publishing, check the deployed version and test the public URL before retrying. The old D1 database is detached, not deleted.

The public `blog.irreversible.workers.dev` address uses a separate Worker in `alias/` that forwards requests to `irreversible-blog`. Deploy the alias only if its configuration changes: `vpx wrangler deploy --config alias/wrangler.jsonc`.
