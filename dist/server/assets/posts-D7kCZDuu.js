import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { f as formatDate } from "./utils-BV4Z0TWH.js";
function BlogPosts({ posts }) {
  return /* @__PURE__ */ jsx("div", { children: posts.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1;
    }
    return 1;
  }).map((post) => /* @__PURE__ */ jsx(
    Link,
    {
      className: "flex flex-col space-y-1 mb-4",
      to: "/blog/$slug",
      params: { slug: post.slug },
      children: /* @__PURE__ */ jsxs("div", { className: "w-full flex flex-col md:flex-row space-x-0 md:space-x-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-neutral-600 dark:text-neutral-400 w-[100px] tabular-nums", children: formatDate(post.metadata.publishedAt, false) }),
        /* @__PURE__ */ jsx("p", { className: "text-neutral-900 dark:text-neutral-100 tracking-tight", children: post.metadata.title })
      ] })
    },
    post.slug
  )) });
}
export {
  BlogPosts as B
};
