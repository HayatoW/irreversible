import { c as createServerRpc } from "./createServerRpc-Bd3B-Ah9.js";
import { compile } from "@mdx-js/mdx";
import { g as getBlogPosts } from "./utils-BV4Z0TWH.js";
import { c as createServerFn } from "../server.js";
import "fs";
import "path";
import "node:async_hooks";
import "node:stream";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
const fetchPost_createServerFn_handler = createServerRpc({
  id: "d39e3af603342128666d4650e5207b208eef47fb76967e612a6dc1a670991b88",
  name: "fetchPost",
  filename: "app/routes/blog.$slug.tsx"
}, (opts) => fetchPost.__executeServer(opts));
const fetchPost = createServerFn({
  method: "GET"
}).inputValidator((slug) => slug).handler(fetchPost_createServerFn_handler, async ({
  data: slug
}) => {
  const post = getBlogPosts().find((p) => p.slug === slug);
  if (!post) return null;
  const code = String(await compile(post.content, {
    outputFormat: "function-body"
  }));
  return {
    metadata: post.metadata,
    slug: post.slug,
    code
  };
});
export {
  fetchPost_createServerFn_handler
};
