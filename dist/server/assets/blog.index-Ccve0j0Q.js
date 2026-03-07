import { c as createServerRpc } from "./createServerRpc-Bd3B-Ah9.js";
import { g as getBlogPosts } from "./utils-BV4Z0TWH.js";
import { c as createServerFn } from "../server.js";
import "fs";
import "path";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
const fetchPosts_createServerFn_handler = createServerRpc({
  id: "8963052f24769e01a5641f3b100e1b803ab9ea6d5d5782528c47e143048a8cae",
  name: "fetchPosts",
  filename: "app/routes/blog.index.tsx"
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
