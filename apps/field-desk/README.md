# Field Desk

teenage engineering の Field Desk を再現した、非公式の 3D ビューアです。
Three.js でモデルを表示し、回転・拡大縮小のほか、背面フレームや接合部への視点切り替えができます。

## 開発

ワークスペースのルートで `vp install` を実行し、`vp run field-desk#dev` で開発サーバーを起動します。
`vp run ready` でワークスペース全体のチェック、テスト、ビルドを実行できます。

## 3D モデル

モデルの生成には、公式の[製品ページ](https://teenage.engineering/products/field-desk)と
[組み立てガイド](https://assets.teenage.engineering/_img/63e1fdfdbccffa80d4522cba_original.pdf)に掲載された寸法、部品図、組み立て順を使っています。
天板の厚さ、穴径、一部の接合金具の形状は[製品写真](https://teenage.engineering/press/field-desk)から推定しています。
形状、天板の木口のテクスチャ、静止画はローカルで生成します。

同梱の GLB と WebP を再生成するには、ワークスペースのルートで Blender 4.5 LTS を使って次のコマンドを実行します。

```sh
blender --background --factory-startup --python-exit-code 1 --python apps/field-desk/model/build.py -- --poster
```

`--poster` を省くと GLB のみを書き出します。アプリには両方のファイルを同梱しています。
開発サーバーの起動や CI でのビルドには Node.js のツールチェーンだけで足ります。

## デプロイ

`main` でアプリに変更が入ると、`Deploy Field Desk` ワークフローがビルドし、Void 経由で `field-desk` Worker にデプロイします。
公開 URL は <https://field-desk.irreversible.workers.dev/> です。

ローカルからデプロイするには、設定済みの Cloudflare アカウントにサインインし、ワークスペースのルートで
`vp run field-desk#build` を実行してから、このディレクトリで `vp run deploy --dir dist --spa` を実行します。
