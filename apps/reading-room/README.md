# Reading Room

ブログの既存記事を DOM と WebGPU で読み比べる、独立した Vite+ SPA です。
紙面上のオレンジのつまみをドラッグするか、キーボードの矢印 / Home / End で境界を動かせます。
記事の選択、DOM / 比較 / GPU の切り替えにも対応します。

```sh
vp run reading-room#dev
vp run reading-room#test
vp run reading-room#build
```

## 描画について

- 記事は `apps/blog/pages/posts` の Markdown をビルド時に直接読み込みます。
- DOM の Range で文字ごとの位置を読み、WebGPU のインスタンス描画でフォントの
  ベジェ曲線をピクセルごとに評価します。ビットマップ / テクスチャ / SDF は使いません。
- [Glyph](https://domgl-text.jesperlandberg.com/) の MIT ライセンスの輪郭抽出と
  バンド付き面積カバレッジシェーダーを使用しています。ライセンスは `public/licenses/Glyph.txt`。
- スクロールは位置のみ更新し、記事の切り替え・リサイズ・フォント読込時に再計測します。
  アイドル時の描画ループはありません。GPU 資源は再計測と破棄時に解放します。
- 元の DOM は保持し、キャンバスは支援技術から隠します。文字選択中・検索の
  キーボードショートカット・印刷時は DOM を見せます。
- WebGPU 非対応、アダプター取得失敗、デバイス喪失、描画エラー、リソース上限超過時は
  DOM に戻ります。比較コントロールを無効にして状態を明示します。
- 日本語フォントは Noto Serif JP 400 のローカルサブセット（SIL OFL、
  `public/licenses/NotoSerifJP.txt`）です。DOM と輪郭データは同じ TTF を使います。
  フォントや輪郭データを取得できない場合は DOM に戻ります。動画は外部リンクに置き換えます。

## フォントの再生成

`prepare:font` は同梱 TTF の全グリフを抽出し、`public/generated` に JSON とバイナリを作成します。
`dev` / `build` が自動で実行します。`vp node` がこの Vite+ では未対応のため、Node 24 を直接呼びます。
同梱 TTF は現在の2記事と ASCII をカバーします。記事に新しい文字を追加したときは、
[元フォント](https://github.com/google/fonts/tree/main/ofl/notoserifjp) を FontTools で
`wght=400` に固定し、記事内の文字と ASCII にサブセット化して差し替えてください。
テストは記事内の全コードポイントと GPU のバンド参照を検証します。

## デプロイ

Field Desk と同様、Void で専用 Cloudflare Worker `reading-room` にデプロイします。
`main` のアプリ / 記事変更時に `Deploy Reading Room` が動きます。

```sh
# apps/reading-room で実行
vp run build
vp run deploy --dir dist --spa
```

同一リポジトリの PR では `Reading Room PR Preview` が Cloudflare Preview を作成し、
URL を PR にコメントします。追加コミットで更新し、PR を閉じると削除します。
既存の `Preview` / `production` Environment と `CLOUDFLARE_API_TOKEN` を使用します。
本番公開はマージ後で、フォークや Dependabot の PR にシークレットは渡しません。
