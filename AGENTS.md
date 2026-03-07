# AGENTS.md

## Cursor Cloud specific instructions

This is a TanStack Start portfolio/blog site ("Irreversible"). Single application, no monorepo.

### Services

| Service | Command | Port | Notes |
|---|---|---|---|
| TanStack Start Dev Server | `pnpm dev` | 3000 | The only service needed |

### Dev commands

- **Dev server**: `pnpm dev` (runs on port 3000)
- **Build**: `pnpm build`
- **Type check**: `npx tsc --noEmit`
- **No ESLint or test framework** is configured in this project.

### Gotchas

- `esbuild` build scripts are ignored by pnpm's default policy in some environments. If Vite fails to start, run `pnpm approve-builds` and allow `esbuild`.
- Blog posts are MDX files in `app/blog/posts/`. No database or environment variables are needed.
- The `@types/react` version in `package.json` (18.x) is behind the actual React version (19.x). This is intentional; `skipLibCheck: true` in `tsconfig.json` avoids type errors.
