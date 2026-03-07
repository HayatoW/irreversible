import * as runtime from "react/jsx-runtime";
import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { runSync } from "@mdx-js/mdx";
import { highlight } from "sugar-high";
import React from "react";
import { f as formatDate } from "./utils-BV4Z0TWH.js";
import { b as Route, c as baseUrl } from "./router-ChMN8y4Q.js";
import "fs";
import "path";
import "@vercel/analytics/react";
import "@vercel/speed-insights/react";
import "@vercel/og";
import "../server.js";
import "node:async_hooks";
import "node:stream";
import "@tanstack/react-router/ssr/server";
function Table({ data }) {
  let headers = data.headers.map((header, index) => /* @__PURE__ */ jsx("th", { children: header }, index));
  let rows = data.rows.map((row, index) => /* @__PURE__ */ jsx("tr", { children: row.map((cell, cellIndex) => /* @__PURE__ */ jsx("td", { children: cell }, cellIndex)) }, index));
  return /* @__PURE__ */ jsxs("table", { children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: headers }) }),
    /* @__PURE__ */ jsx("tbody", { children: rows })
  ] });
}
function CustomLink(props) {
  let href = props.href;
  if (href.startsWith("/")) {
    return /* @__PURE__ */ jsx(Link, { to: href, ...props, children: props.children });
  }
  if (href.startsWith("#")) {
    return /* @__PURE__ */ jsx("a", { ...props });
  }
  return /* @__PURE__ */ jsx("a", { target: "_blank", rel: "noopener noreferrer", ...props });
}
function RoundedImage(props) {
  return /* @__PURE__ */ jsx("img", { alt: props.alt, className: "rounded-lg", ...props });
}
function Code({ children, ...props }) {
  let codeHTML = highlight(children);
  return /* @__PURE__ */ jsx("code", { dangerouslySetInnerHTML: { __html: codeHTML }, ...props });
}
function slugify(str) {
  return str.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/&/g, "-and-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");
}
function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children);
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement("a", {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: "anchor"
        })
      ],
      children
    );
  };
  Heading.displayName = `Heading${level}`;
  return Heading;
}
let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  Table
};
function CustomMDX({ code }) {
  const { default: Content } = runSync(code, {
    ...runtime
  });
  return /* @__PURE__ */ jsx(Content, { components });
}
function BlogPost() {
  const {
    metadata,
    slug,
    code
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx("script", { type: "application/ld+json", suppressHydrationWarning: true, dangerouslySetInnerHTML: {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: metadata.title,
        datePublished: metadata.publishedAt,
        dateModified: metadata.publishedAt,
        description: metadata.summary,
        image: metadata.image ? `${baseUrl}${metadata.image}` : `/og?title=${encodeURIComponent(metadata.title)}`,
        url: `${baseUrl}/blog/${slug}`,
        author: {
          "@type": "Person",
          name: "Hayato Watanabe"
        }
      })
    } }),
    /* @__PURE__ */ jsx("h1", { className: "title font-semibold text-2xl tracking-tighter", children: metadata.title }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-between items-center mt-2 mb-8 text-sm", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: formatDate(metadata.publishedAt) }) }),
    /* @__PURE__ */ jsx("article", { className: "prose", children: /* @__PURE__ */ jsx(CustomMDX, { code }) })
  ] });
}
export {
  BlogPost as component
};
