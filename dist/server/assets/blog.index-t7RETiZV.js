import { jsxs, jsx } from "react/jsx-runtime";
import { B as BlogPosts } from "./posts-D7kCZDuu.js";
import { a as Route } from "./router-B7j_1Miw.js";
import "@tanstack/react-router";
import "./utils-BV4Z0TWH.js";
import "fs";
import "path";
import "@vercel/analytics/react";
import "@vercel/speed-insights/react";
import "@vercel/og";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
function BlogPage() {
  const {
    posts
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx("h1", { className: "font-semibold text-2xl mb-8 tracking-tighter", children: "Blog" }),
    /* @__PURE__ */ jsx(BlogPosts, { posts })
  ] });
}
export {
  BlogPage as component
};
