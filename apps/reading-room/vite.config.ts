import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      // These ignored assets must exist even after cleaning public/generated.
      "prepare:font": { command: "node scripts/prepare-font.mjs", cache: false },
    },
  },
});
