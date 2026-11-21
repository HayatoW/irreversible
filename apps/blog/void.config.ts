import { defineConfig } from "void/config";

export default defineConfig({
  cloudflare: {
    name: "blog",
    preview_urls: false,
    routes: [],
    workers_dev: true,
  },
  head: {
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
    ],
    title: "Irreversible",
  },
  routing: { typedRoutes: true },
  worker: {
    compatibility_date: "2025-12-01",
    compatibility_flags: ["nodejs_compat", "no_handle_cross_request_promise_resolution"],
  },
});
