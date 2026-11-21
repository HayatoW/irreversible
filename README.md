# Irreversible

[![CI](https://github.com/HayatoW/irreversible/actions/workflows/ci.yml/badge.svg)](https://github.com/HayatoW/irreversible/actions/workflows/ci.yml)

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

- Run the development server:

```bash
vp run dev
```

## Field Desk

`vp run field-desk#dev` で Three.js の 3D ビューアを起動できます。
公開先は Void で管理する専用の Cloudflare Worker です。Blender でのモデル再生成と
デプロイの手順は [Field Desk の README](apps/field-desk/README.md) を参照してください。
