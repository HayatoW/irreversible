import { c as createServerRpc } from "./createServerRpc-Bd3B-Ah9.js";
import { g as getBlogPosts } from "./utils-BV4Z0TWH.js";
import { c as createServerFn } from "../server.js";
import "fs";
import "path";
import "node:async_hooks";
import "node:stream";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
const fetchPosts_createServerFn_handler = createServerRpc({
  id: "9395cb5cb4ae04a4f6a312c691b34fbceaeb06d7228251667f9714b76dcd3d58",
  name: "fetchPosts",
  filename: "app/routes/index.tsx"
}, (opts) => fetchPosts.__executeServer(opts));
const fetchPosts = createServerFn().handler(fetchPosts_createServerFn_handler, () => {
  return getBlogPosts().map(({
    content,
    ...rest
  }) => rest);
});
export {
  fetchPosts_createServerFn_handler
};
