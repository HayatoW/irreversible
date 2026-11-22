import { defineConfig } from "cf/config";

// The Preview deploy uses the same SPA fallback as Void's production deploy.
export default defineConfig({
  worker: {
    name: "field-desk",
    compatibilityDate: "2025-12-01",
    assets: { notFoundHandling: "single-page-application" },
  },
});
