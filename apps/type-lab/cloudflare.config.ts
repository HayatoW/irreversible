import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "type-lab",
    compatibilityDate: "2025-12-01",
    assets: { notFoundHandling: "single-page-application" },
  },
});
