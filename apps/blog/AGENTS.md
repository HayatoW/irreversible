# Blog (Remix 3)

This app is built with Remix 3 (the `remix` package), not React Router or Remix v2.
Docs live at `node_modules/remix/INDEX.md` and `node_modules/remix/guides/` — consult them before
changing routing, controllers, components, or tests.

- Routes are declared in `app/routes.ts`, wired in `app/router.tsx`, implemented in `app/actions/`.
- Components use `jsxImportSource: "remix/component"`; styles use `css()` mixins via the `mix` prop;
  global tokens live in `app/actions/public/app.css`. Colocated `public/` dirs hold browser code.
- Blog posts are Markdown files in `app/blogs/` parsed and rendered to HTML by `app/lib/blogs.ts`.

Commands (Node >= 24.3 required, use `vp env`):

```bash
pnpm dev        # remix dev server on http://localhost:3000
pnpm test       # remix test
pnpm typecheck  # tsc --noEmit
pnpm start      # production mode
```
