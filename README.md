# Irreversible

[![CI](https://github.com/HayatoW/irreversible/actions/workflows/ci.yml/badge.svg)](https://github.com/HayatoW/irreversible/actions/workflows/ci.yml)
[![Built by Devin](https://raw.githubusercontent.com/club-cog/built-by-devin/main/badges/built-by-devin.svg)](https://devin.ai)

HayatoW's portfolio.

## Development

- Check everything is ready:

```bash
vp run ready
```

- Run the tests:

```bash
vp run -r test
```

- Build the monorepo:

```bash
vp run -r build
```

- Run the blog development server:

```bash
vp run dev:blog
```

## Field Desk

`vp run field-desk#dev` で Three.js の 3D ビューアを起動できます。
公開先は Void で管理する専用の Cloudflare Worker です。Blender でのモデル再生成と
デプロイの手順は [Field Desk の README](apps/field-desk/README.md) を参照してください。

## 字形 — Type Lab

`vp run type-lab#dev` で、日本語フォントの輪郭を観察する実験室を起動できます。
明朝とゴシック、輪郭と塗り、組版の設定を切り替えられます。WebGPU非対応環境や
未収録の文字ではDOMで表示します。詳細は [Type Lab の README](apps/type-lab/README.md) を参照してください。

## PR Previews

`main` 向けの同一リポジトリ内の PR では、Cloudflare Workers Previews が
Blog、Field Desk、Type Lab を公開します。URL は PR のコメントに表示され、追加コミットで
同じ URL が更新されます。PR を閉じると Preview は削除されます。

Preview は公開 URL ですが、本番のトラフィックや Blog の ISR 用 KV には接続しません。
フォークと Dependabot の PR では、シークレットを使うデプロイは実行しません。
