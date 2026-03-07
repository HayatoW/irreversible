---
name: TanStack Start Migration
overview: Next.js 16 (App Router) で構築されたポートフォリオ/ブログサイト「Irreversible」を TanStack Start に移行する。ルーティング、MDX レンダリング、フォント、メタデータ、API ルートの全てを移行対象とする。
todos:
  - id: deps
    content: Next.js 削除 & TanStack Start 依存関係インストール、postcss.config.js 削除
    status: completed
  - id: config
    content: package.json, vite.config.ts, tsconfig.json 設定更新
    status: completed
  - id: router
    content: app/router.tsx 作成
    status: completed
  - id: root-layout
    content: layout.tsx -> routes/__root.tsx 移行（フォント、メタデータ、Outlet/Scripts）
    status: completed
  - id: pages
    content: page.tsx -> routes/index.tsx, blog.index.tsx, blog.$slug.tsx 移行
    status: completed
  - id: components
    content: nav.tsx, posts.tsx, mdx.tsx のインポート置換（next/link, next/image, MDX）
    status: completed
  - id: server-routes
    content: og, rss, sitemap サーバールート移行 & robots.txt 静的化
    status: completed
  - id: config-extract
    content: baseUrl を config.ts に抽出
    status: completed
  - id: fonts-css
    content: フォント移行（fontsource 導入、global.css 更新）
    status: completed
  - id: cleanup
    content: "旧 Next.js ファイル削除: layout.tsx, page.tsx, blog/page.tsx, blog/[slug]/, not-found.tsx, og/, rss/, sitemap.ts, robots.ts, postcss.config.js, next-env.d.ts"
    status: completed
  - id: verify
    content: dev サーバー起動・動作確認、型チェック
    status: completed
  - id: agents-md
    content: AGENTS.md 更新
    status: completed
isProject: false
---

# Next.js から TanStack Start への移行計画

## 現状分析

- **フレームワーク**: Next.js 16 (App Router), React 19, Tailwind CSS 4 alpha
- **ルート数**: 4ページ + 2 API ルート + sitemap + robots
- **MDX**: `next-mdx-remote/rsc` で 2 記事をレンダリング（JSX 要素は `<iframe>` と `<br/>` のみ）
- **フォント**: `next/font/google` (Noto Sans JP) + `geist/font/mono` (Geist Mono)
- **Next.js 固有機能**: `next/link`(3 ファイル), `next/image`(1), `next/og`(1), `next/navigation`(1), `metadata`/`generateMetadata`(3)

## 移行後のディレクトリ構造

```
app/
  routes/                  <- TanStack Router ルートファイル
    __root.tsx             <- ルートレイアウト
    index.tsx              <- /
    blog.index.tsx         <- /blog
    blog.$slug.tsx         <- /blog/:slug
    og.tsx                 <- /og (サーバールート)
    rss.tsx                <- /rss (サーバールート)
    sitemap.tsx            <- /sitemap (サーバールート)
  components/              <- 共有コンポーネント（変更なし）
    footer.tsx
    mdx.tsx
    nav.tsx
    posts.tsx
  blog/                    <- ブログデータ（変更なし）
    posts/*.mdx
    utils.ts
  global.css
  config.ts                <- 共有定数 (baseUrl など)
  router.tsx               <- ルーター設定
  routeTree.gen.ts         <- 自動生成
public/
  robots.txt               <- 静的ファイル
vite.config.ts
```

## Step 1: 依存関係の入れ替え

**削除**: `next`, `@tailwindcss/postcss`, `next-mdx-remote`, `postcss`

**追加** (dependencies):

- `@tanstack/react-router`, `@tanstack/react-start`
- `@mdx-js/mdx` (`next-mdx-remote` の代替)
- `@fontsource-variable/noto-sans-jp` (`next/font/google` の代替)

**追加** (devDependencies):

- `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss` (v4 stable), `vite-tsconfig-paths`

**削除するファイル**: `postcss.config.js`

## Step 2: 設定ファイル更新

**[package.json](package.json)**: `"type": "module"` 追加、scripts 更新

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "start": "node .output/server/index.mjs"
  }
}
```

**vite.config.ts** (新規作成):

```ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: { port: 3000 },
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    tanstackStart({
      srcDirectory: 'app',
      router: { routesDirectory: 'routes' },
    }),
    viteReact(),
  ],
})
```

**[tsconfig.json](tsconfig.json)**: `module`/`moduleResolution` を Bundler に変更、`jsx` を `react-jsx` 維持、Next.js プラグイン削除

## Step 3: ルーター設定

**app/router.tsx** (新規):

```tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createRouter({ routeTree, scrollRestoration: true })
  return router
}
```

## Step 4: ルートレイアウト移行

[app/layout.tsx](app/layout.tsx) -> `app/routes/__root.tsx`

主な変更点:

- `next/font/google` -> `@fontsource-variable/noto-sans-jp` (CSS import)
- `geist/font/mono` -> `@fontsource/geist-mono` またはCDN経由
- Next.js `Metadata` export -> TanStack Start の `head()` 関数
- `{children}` -> `<Outlet />`
- `<head>` に `<HeadContent />`, `<body>` 末尾に `<Scripts />` 追加
- `@vercel/speed-insights/next` -> `@vercel/speed-insights/react`

## Step 5: ページ移行

### / (トップ)

[app/page.tsx](app/page.tsx) -> `app/routes/index.tsx`

- `createFileRoute('/')` でルート定義
- `BlogPosts` に loader からデータを渡す（後述）

### /blog (一覧)

[app/blog/page.tsx](app/blog/page.tsx) -> `app/routes/blog.index.tsx`

- `createFileRoute('/blog/')` でルート定義
- `metadata` export -> `head()` 関数
- `BlogPosts` に loader からデータを渡す

### /blog/:slug (記事詳細)

[app/blog/[slug]/page.tsx](app/blog/[slug]/page.tsx) -> `app/routes/blog.$slug.tsx`

- `createFileRoute('/blog/$slug')` でルート定義
- `generateMetadata` -> `head()` 関数 (loader データ参照)
- `generateStaticParams` -> 不要（動的ルーティング）
- `notFound()` -> `notFound({ throw: true })` from `@tanstack/react-router`
- MDX コンパイルを loader で実行

### 404

[app/not-found.tsx](app/not-found.tsx) -> `__root.tsx` の `notFoundComponent` に統合

## Step 6: コンポーネント移行

### [app/components/nav.tsx](app/components/nav.tsx)

- `next/link` -> `Link` from `@tanstack/react-router`
- `href` prop -> `to` prop

### [app/components/posts.tsx](app/components/posts.tsx)

- `next/link` -> `Link` from `@tanstack/react-router`
- `getBlogPosts()` 直接呼び出し -> props でデータ受け取り（loader からの注入）

### [app/components/mdx.tsx](app/components/mdx.tsx)

- `next/link` -> `Link` from `@tanstack/react-router`
- `next/image` -> 標準 `<img>` タグ
- `next-mdx-remote/rsc` -> `@mdx-js/mdx` の `runSync`

## Step 7: MDX レンダリング戦略

`next-mdx-remote/rsc` を `@mdx-js/mdx` で置き換える:

1. **Loader** (サーバー側): `compile(content, { outputFormat: 'function-body' })` で MDX をコンパイルし、シリアライズ可能な文字列を取得
2. **Component** (SSR + Client): `runSync(code, runtime)` で同期的に React コンポーネントを生成
3. カスタムコンポーネント (headings, code, links) を渡してレンダリング

```tsx
// loader
const code = String(await compile(post.content, { outputFormat: 'function-body' }))

// component
const { default: Content } = runSync(code, { ...runtime })
return <Content components={mdxComponents} />
```

## Step 8: サーバールート移行

### /og (OG 画像)

[app/og/route.tsx](app/og/route.tsx) -> `app/routes/og.tsx`

- `next/og` の `ImageResponse` -> `@vercel/og` の `ImageResponse`（スタンドアロン版）
- フォールバック: `satori` + `@resvg/resvg-js`
- TanStack Start の `server.handlers.GET` パターンで定義

### /rss (RSS フィード)

[app/rss/route.ts](app/rss/route.ts) -> `app/routes/rss.tsx`

- `server.handlers.GET` で Response を返す

### /sitemap (サイトマップ)

[app/sitemap.ts](app/sitemap.ts) -> `app/routes/sitemap.tsx`

- `server.handlers.GET` で XML Response を返す
- URL を `/sitemap.xml` から `/sitemap` に変更

### robots.txt

[app/robots.ts](app/robots.ts) -> `public/robots.txt` (静的ファイル化)

- サイトマップ URL を更新

## Step 9: フォント移行

[app/global.css](app/global.css) に以下を追加:

```css
@import '@fontsource-variable/noto-sans-jp';
```

Tailwind の `@theme` でフォントファミリーを定義するか、直接 body に `font-family` を適用。

`geist/font/mono` については `@fontsource/geist-mono` パッケージを使用するか、Geist Mono の CSS ファイルを直接 import。

## Step 10: 不要ファイル削除

移行完了後、以下の旧 Next.js ファイル/ディレクトリを削除:

- `app/layout.tsx` (-> `app/routes/__root.tsx`)
- `app/page.tsx` (-> `app/routes/index.tsx`)
- `app/blog/page.tsx` (-> `app/routes/blog.index.tsx`)
- `app/blog/[slug]/` ディレクトリ (-> `app/routes/blog.$slug.tsx`)
- `app/not-found.tsx` (-> `__root.tsx` に統合)
- `app/og/` ディレクトリ (-> `app/routes/og.tsx`)
- `app/rss/` ディレクトリ (-> `app/routes/rss.tsx`)
- `app/sitemap.ts` (-> `app/routes/sitemap.tsx` + `app/config.ts`)
- `app/robots.ts` (-> `public/robots.txt`)
- `postcss.config.js`
- `next-env.d.ts` (存在する場合)

## Step 11: 共有定数の抽出

[app/sitemap.ts](app/sitemap.ts) から `baseUrl` を `app/config.ts` に移動し、各ルートから参照。

## Step 11: AGENTS.md 更新

ビルドコマンド等の説明を TanStack Start に合わせて更新。

## 注意事項

- `**@vercel/og**`: Next.js 外で動作しない場合は `satori` + `@resvg/resvg-js` に切り替え
- **Tailwind CSS**: alpha (4.0.0-alpha.13) から stable v4 にアップグレード。`@import 'tailwindcss'` の構文は維持
- `**@vercel/analytics`**: `@vercel/analytics/react` はそのまま動作
- `**@vercel/speed-insights`**: `/next` → `/react` に変更
- **Blog posts の fs 読み取り**: `getBlogPosts()` は loader/server function 内でのみ呼び出すよう変更

