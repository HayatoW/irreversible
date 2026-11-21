import tailwindcss from "@tailwindcss/vite";
import { voidMarkdown } from "@void/md/plugin";
import { voidReact } from "@void/react/plugin";
import { defineConfig, lazyPlugins } from "vite-plus";
import { voidPlugin } from "void";

export default defineConfig({
  fmt: {
    experimentalSortImports: {
      newlinesBetween: false,
    },
    experimentalSortPackageJson: {
      sortScripts: true,
    },
    experimentalTailwindcss: {
      stylesheet: "src/App.css",
    },
    ignorePatterns: [
      "**/.cloudflare/**",
      ".void/",
      ".void-wrangler.jsonc",
      "dist/",
      "node_modules/",
      "pnpm-lock.yaml",
    ],
    singleQuote: true,
  },
  lint: {
    ignorePatterns: [
      "**/.cloudflare/**",
      ".void",
      ".void-wrangler.jsonc",
      "dist",
      "node_modules",
      "vite.config.ts.timestamp-*",
    ],
    options: { typeAware: true, typeCheck: true },
  },
  plugins: lazyPlugins(() => [tailwindcss(), voidPlugin(), voidReact(), voidMarkdown()]),
  server: { port: 6001 },
  staged: {
    "*": "vp check --fix",
  },
});
