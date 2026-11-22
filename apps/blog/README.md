# Blog

ブログは Void のページルーターと React で実装しています。投稿一覧は `/posts` です。投稿は `pages/posts/` に Markdown で置き、ファイル名が公開 URL の末尾になります。

## ローカル開発

Node.js 24.22 以降の 24.x 系、または Node.js 26.12 以降と、[Vite+](https://viteplus.dev/guide/) を使います。リポジトリのルートで実行してください。

```sh
vp install --frozen-lockfile
vp run dev:blog
```

`http://localhost:6001` を開きます。ルートで `vp run ready` を実行すると、Void の型生成、ワークスペースのチェック、テスト、ビルドが走ります。

## Cloudflare へのデプロイ

ブログは `blog` Worker にデプロイし、[blog.irreversible.workers.dev](https://blog.irreversible.workers.dev/posts) で公開します。`main` でアプリに変更が入ると `Deploy Blog` ワークフローが自動でデプロイします。手動でデプロイする場合は `apps/blog` で次を実行してください。

```sh
CLOUDFLARE_WORKERS_SUBDOMAIN=irreversible vp exec void deploy --platform cloudflare
```

CI で使う Cloudflare API トークンは `void.lock.json` のアカウントに限定し、Workers Scripts: Edit と Workers KV Storage: Edit を付与してください。Markdown ページのキャッシュには KV を使います。D1 は使いません。
