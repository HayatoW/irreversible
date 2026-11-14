import { defineConfig } from "void/config";

export default defineConfig({
  inference: {
    appType: "spa",
  },
  cloudflare: {
    name: "irreversible",
  },
});
