# 字形 — Japanese Type Lab

和文フォントの輪郭を観察する、独立したタイポグラフィ実験室です。
[Glyph / DomGL Text](https://domgl-text.jesperlandberg.com/) に着想を得ていますが、実装は独自です。

## 開発

ルートで `vp install`、`vp run type-lab#dev` を実行します。
`vp run type-lab#test` で字形の収録範囲・バンド分割・レスポンシブ組版を検証、
`vp run type-lab#build` で型チェックとビルド、`vp run ready` で全体を検証します。

明朝とゴシック、輪郭と塗り、文字サイズ、字間、線幅、横組みと縦積みを変更できます。
文字サイズは表示領域に合わせて縮小され、実際のサイズをプレビュー下に表示します。
縦積みは一字ずつ縦に配置する簡易組版で、縦用の約物・字形置換は行いません。

## 描画とフォールバック

- Noto Serif JP / Noto Sans JP Regular の同一サブセットをDOMとGPUの双方で利用します。
- フォント輪郭の曲線を事前に線分化（誤差目標 0.00025 em）し、フラグメントシェーダーで
  nonzero windingと線分までの距離を評価。y方向32バンドで参照線分数を減らします。
  元デモの exact-area ベジェ解析ではなく、近似輪郭＋距離ベースのアンチエイリアスです。
- GPUは画像やフォントテクスチャを使いません。DOMの各文字位置を読み、同じ場所に描きます。
- 常時アニメーションはなく、設定・サイズ変更時のみ再描画します。解像度は最大2倍です。
- GPU初期化・描画失敗、device loss、未対応環境ではDOMで表示。未収録字を含む場合も
  試し組み全体をDOMに戻し、システムフォントのフォールバックを使います。
- サンプル、かな、ASCII、選定した漢字を収録。任意の日本語すべてのGPU描画は対象外です。
  未収録時は画面に明示します。文字はGPU表示中もDOMで選択・コピーできます。

## フォントの再生成

同梱のWOFF2・輪郭バイナリ・字形インデックスJSONは [Google Fonts](https://github.com/google/fonts) の
`06bfe0d62a98375cb09c942fa18e68bd32cff057` から抽出しています。
ライセンスは `public/fonts/*-OFL.txt`。フォントファイルに改変した名称は付けていません。
通常の開発・CIにPythonや外部フォントCDNは不要です。

再生成する場合は Python 3 に `fonttools==4.65.0` と `brotli==1.2.1` を入れ、
`python apps/type-lab/scripts/build-fonts.py` をルートで実行します。
収録文字はこのスクリプトの `TEXT` で管理します。

## デプロイ

既存のField Deskと同じ、Vite+のSPAビルドとVoid / Cloudflare Workers構成です。
PRでは `Deploy PR Previews` が `type-lab` のPreviewを作成してリンクを投稿します。
`main` にマージ後、`Deploy Type Lab` が `type-lab` Workerへデプロイします。
公開先は `https://type-lab.irreversible.workers.dev/` です（初回マージ後）。

ローカルからは `vp run type-lab#build` のあと、このディレクトリで
`vp run deploy --dir dist --spa` を実行します。Cloudflareの認証が必要です。
