import { defineConfig } from "void/config";

const isPreview = process.env.CLOUDFLARE_PREVIEW_BUILD === "true";

export default defineConfig({
  cloudflare: {
    name: "blog",
    preview_urls: true,
    routes: [],
    workers_dev: true,
    ...(isPreview && { kv_namespaces: [] }),
  },
  head: {
    htmlAttrs: {
      lang: "en",
    },
    link: [
      { crossorigin: "", href: "https://cdn.jsdelivr.net", rel: "preconnect" },
      // Gen Interface JP (https://gen.typesetting.jp/) — 本文で使うウエイトのみ読み込む
      ...[400, 500, 600, 700].map((weight) => ({
        href: `https://cdn.jsdelivr.net/npm/gen-interface-jp@0.8.0/cdn/${weight}.css`,
        rel: "stylesheet",
      })),
    ],
    meta: [
      { charset: "utf8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
    ],
    title: "Irreversible",
  },
  routing: { typedRoutes: true, ...(isPreview && { isr: false }) },
  worker: {
    compatibility_date: "2025-12-01",
    compatibility_flags: ["nodejs_compat", "no_handle_cross_request_promise_resolution"],
  },
});
