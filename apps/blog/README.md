# Irreversible ブログ

ブログは Void のページルーターと React で実装しています。投稿一覧は `/posts` です。投稿は `pages/posts/` に Markdown で置き、ファイル名が公開 URL の末尾になります。

## ローカル開発

Node.js 24.22 以降の 24.x 系、または Node.js 26.12 以降と、[Vite+](https://viteplus.dev/guide/) を使います。リポジトリのルートで実行してください。

```sh
vp install --frozen-lockfile
vp run dev:blog
```

`http://localhost:6001` を開きます。ルートで `vp run ready` を実行すると、Void の型生成、ワークスペースのチェック、テスト、ビルドが走ります。

## Cloudflare へのデプロイ

リポジトリの本番ワークフローは `apps/website` だけをデプロイします。ブログは別の Worker（`irreversible-blog`）に公開します。`apps/blog` で次を実行してください。

```sh
vp exec void deploy --platform cloudflare
```

CI で使う Cloudflare API トークンは `void.lock.json` のアカウントに限定し、Workers Scripts: Edit と Workers KV Storage: Edit を付与してください。Markdown ページのキャッシュには KV を使います。D1 は使いません。

プレイグラウンドのライブ更新用 Durable Object を廃止するには、アトミックデプロイが必要です。以降のデプロイで Void が未適用の Durable Object マイグレーションを報告する場合も、表示されたタグを確認して次のコマンドで再実行してください。

```sh
vp exec void deploy --platform cloudflare --atomic
```

このモードでは、Void が準備完了を確認する前に Cloudflare がトラフィックを切り替えます。公開後にコマンドが失敗した場合は、再実行の前にデプロイ済みのバージョンと公開 URL の応答を確認してください。旧 D1 データベースは Worker から切り離しただけで、削除していません。

公開 URL の `blog.irreversible.workers.dev` は、`alias/` の別 Worker を経由して `irreversible-blog` にリクエストを転送します。エイリアスは設定を変更した場合のみデプロイします: `vpx wrangler deploy --config alias/wrangler.jsonc`。
