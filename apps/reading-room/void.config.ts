import { defineConfig } from "void/config";

export default defineConfig({
  inference: { appType: "spa" },
  cloudflare: {
    account_id: "1c5b61e0bfd3a45c3b3c10207fb6136d",
    name: "reading-room",
    preview_urls: true,
    workers_dev: true,
  },
});
