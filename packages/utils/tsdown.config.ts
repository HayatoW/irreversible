import { defineConfig } from "vite-plus/pack";

export default defineConfig({
  deps: { resolveDepSubpath: true },
  dts: {
    generator: "tsgo",
  },
  exports: true,
  // ...config options
});
