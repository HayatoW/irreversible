import { defineConfig } from "vite-plus";

export default defineConfig({
  // https://vite.dev/guide/troubleshooting#dev-containers-vs-code-port-forwarding
  server: "127.0.0.1",
  staged: {
    "*": "vp check --fix",
  },
  lint: { options: { typeAware: true, typeCheck: true } },
});
