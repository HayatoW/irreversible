import { jsxs, jsx } from "react/jsx-runtime";
import { B as BlogPosts } from "./posts-D7kCZDuu.js";
import { R as Route } from "./router-ChMN8y4Q.js";
import "@tanstack/react-router";
import "./utils-BV4Z0TWH.js";
import "fs";
import "path";
import "@vercel/analytics/react";
import "@vercel/speed-insights/react";
import "@vercel/og";
import "../server.js";
import "node:async_hooks";
import "node:stream";
import "@tanstack/react-router/ssr/server";
function Page() {
  const {
    posts
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx("h1", { className: "mb-8 text-2xl font-semibold tracking-tighter", children: "Irreversible" }),
    /* @__PURE__ */ jsx("iframe", { className: "w-full aspect-video", src: "https://www.youtube.com/embed/TfTODnT_dUw?si=KKFKiouh1ULbd8mf", title: "YouTube video player", frameBorder: "0", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", referrerPolicy: "strict-origin-when-cross-origin", allowFullScreen: true }),
    /* @__PURE__ */ jsxs("p", { className: "my-4", children: [
      `Hello Friend.`,
      /* @__PURE__ */ jsx("br", {}),
      `Software Engineer. 愛猫家。`,
      /* @__PURE__ */ jsx("br", {}),
      `These New Puritans, Nils Frahm, ACRNM`
    ] }),
    /* @__PURE__ */ jsx("div", { className: "my-8", children: /* @__PURE__ */ jsx(BlogPosts, { posts }) })
  ] });
}
export {
  Page as component
};
