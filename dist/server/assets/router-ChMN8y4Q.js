import { Link, createRootRoute, HeadContent, Outlet, Scripts, createFileRoute, lazyRouteComponent, notFound, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { g as getBlogPosts } from "./utils-BV4Z0TWH.js";
import { ImageResponse } from "@vercel/og";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
const navItems = {
  "/": {
    name: "home"
  },
  "/blog": {
    name: "blog"
  }
};
function Navbar() {
  return /* @__PURE__ */ jsx("aside", { className: "-ml-[8px] mb-16 tracking-tight", children: /* @__PURE__ */ jsx("div", { className: "lg:sticky lg:top-20", children: /* @__PURE__ */ jsx(
    "nav",
    {
      className: "flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative",
      id: "nav",
      children: /* @__PURE__ */ jsx("div", { className: "flex flex-row space-x-0 pr-10", children: Object.entries(navItems).map(([path, { name }]) => {
        return /* @__PURE__ */ jsx(
          Link,
          {
            to: path,
            className: "transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2 m-1",
            children: name
          },
          path
        );
      }) })
    }
  ) }) });
}
function ArrowIcon() {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      width: "12",
      height: "12",
      viewBox: "0 0 12 12",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ jsx(
        "path",
        {
          d: "M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z",
          fill: "currentColor"
        }
      )
    }
  );
}
function Footer() {
  return /* @__PURE__ */ jsx("footer", { className: "mb-16", children: /* @__PURE__ */ jsxs("ul", { className: "font-sm mt-8 flex flex-col space-x-0 space-y-2 text-neutral-600 md:flex-row md:space-x-4 md:space-y-0 dark:text-neutral-300", children: [
    /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
      "a",
      {
        className: "flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100",
        rel: "noopener noreferrer",
        target: "_blank",
        href: "https://github.com/HayatoW",
        children: [
          /* @__PURE__ */ jsx(ArrowIcon, {}),
          /* @__PURE__ */ jsx("p", { className: "ml-2 h-7", children: "GitHub" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
      "a",
      {
        className: "flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100",
        rel: "noopener noreferrer",
        target: "_blank",
        href: "https://x.com/nabecmdctrl",
        children: [
          /* @__PURE__ */ jsx(ArrowIcon, {}),
          /* @__PURE__ */ jsx("p", { className: "ml-2 h-7", children: "X" })
        ]
      }
    ) })
  ] }) });
}
const baseUrl = "https://irreversible.vercel.app";
const appCss = "/assets/global-D8Dbae32.css";
const fontsNoto = "/assets/index-LGYI1EnV.css";
const fontsGeistMono = "/assets/index-BSZy4-jE.css";
const Route$6 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Irreversible" },
      { name: "description", content: "This is my portfolio." },
      { property: "og:title", content: "Irreversible" },
      { property: "og:description", content: "This is my portfolio." },
      { property: "og:url", content: baseUrl },
      { property: "og:site_name", content: "Irreversible" },
      { property: "og:locale", content: "en_US" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "index, follow" },
      {
        name: "googlebot",
        content: "index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"
      }
    ],
    links: [
      { rel: "stylesheet", href: fontsNoto },
      { rel: "stylesheet", href: fontsGeistMono },
      { rel: "stylesheet", href: appCss }
    ]
  }),
  component: RootLayout,
  notFoundComponent: NotFound
});
function NotFound() {
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx("h1", { className: "mb-8 text-2xl font-semibold tracking-tighter", children: "404 - Page Not Found" }),
    /* @__PURE__ */ jsx("p", { className: "mb-4", children: "The page you are looking for does not exist." })
  ] });
}
function RootLayout() {
  return /* @__PURE__ */ jsxs(
    "html",
    {
      lang: "ja",
      className: "text-black bg-white dark:text-white dark:bg-black font-sans",
      children: [
        /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
        /* @__PURE__ */ jsxs("body", { className: "antialiased max-w-xl mx-4 mt-8 lg:mx-auto", children: [
          /* @__PURE__ */ jsxs("main", { className: "flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0", children: [
            /* @__PURE__ */ jsx(Navbar, {}),
            /* @__PURE__ */ jsx(Outlet, {}),
            /* @__PURE__ */ jsx(Footer, {}),
            /* @__PURE__ */ jsx(Analytics, {}),
            /* @__PURE__ */ jsx(SpeedInsights, {})
          ] }),
          /* @__PURE__ */ jsx(Scripts, {})
        ] })
      ]
    }
  );
}
const Route$5 = createFileRoute("/sitemap")({
  server: {
    handlers: {
      GET: async () => {
        const blogs = getBlogPosts().map((post) => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: post.metadata.publishedAt
        }));
        const routes = ["", "/blog"].map((route) => ({
          url: `${baseUrl}${route}`,
          lastModified: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
        }));
        const entries = [...routes, ...blogs];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(
          (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
  </url>`
        ).join("\n")}
</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml"
          }
        });
      }
    }
  }
});
const Route$4 = createFileRoute("/rss")({
  server: {
    handlers: {
      GET: async () => {
        const allBlogs = getBlogPosts();
        const itemsXml = allBlogs.sort((a, b) => {
          if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
            return -1;
          }
          return 1;
        }).map(
          (post) => `<item>
          <title>${post.metadata.title}</title>
          <link>${baseUrl}/blog/${post.slug}</link>
          <description>${post.metadata.summary || ""}</description>
          <pubDate>${new Date(
            post.metadata.publishedAt
          ).toUTCString()}</pubDate>
        </item>`
        ).join("\n");
        const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>Irreversible</title>
        <link>${baseUrl}</link>
        <description>This is my portfolio RSS feed</description>
        ${itemsXml}
    </channel>
  </rss>`;
        return new Response(rssFeed, {
          headers: {
            "Content-Type": "text/xml"
          }
        });
      }
    }
  }
});
const Route$3 = createFileRoute("/og")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const title = url.searchParams.get("title") || "Irreversible";
        return new ImageResponse(
          /* @__PURE__ */ jsx(
            "div",
            {
              tw: "flex flex-col w-full h-full items-center justify-center bg-white",
              children: /* @__PURE__ */ jsx("div", { tw: "flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8", children: /* @__PURE__ */ jsx("h2", { tw: "flex flex-col text-4xl font-bold tracking-tight text-left", children: title }) })
            }
          ),
          {
            width: 1200,
            height: 630
          }
        );
      }
    }
  }
});
const createSsrRpc = (functionId, importer) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    const serverFn = await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const $$splitComponentImporter$2 = () => import("./index-EZZfU3_R.js");
const fetchPosts$1 = createServerFn().handler(createSsrRpc("9395cb5cb4ae04a4f6a312c691b34fbceaeb06d7228251667f9714b76dcd3d58"));
const Route$2 = createFileRoute("/")({
  loader: async () => {
    return {
      posts: await fetchPosts$1()
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./blog.index-Bm1AMt6p.js");
const fetchPosts = createServerFn().handler(createSsrRpc("8963052f24769e01a5641f3b100e1b803ab9ea6d5d5782528c47e143048a8cae"));
const Route$1 = createFileRoute("/blog/")({
  head: () => ({
    meta: [{
      title: "Blog | Irreversible"
    }, {
      name: "description",
      content: "Read my blog."
    }]
  }),
  loader: async () => {
    return {
      posts: await fetchPosts()
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./blog._slug-C9ifUN3_.js");
const fetchPost = createServerFn({
  method: "GET"
}).inputValidator((slug) => slug).handler(createSsrRpc("d39e3af603342128666d4650e5207b208eef47fb76967e612a6dc1a670991b88"));
const Route = createFileRoute("/blog/$slug")({
  loader: async ({
    params
  }) => {
    const data = await fetchPost({
      data: params.slug
    });
    if (!data) {
      throw notFound();
    }
    return data;
  },
  head: ({
    loaderData
  }) => {
    if (!loaderData) return {};
    const {
      metadata: {
        title,
        publishedAt: publishedTime,
        summary: description,
        image
      },
      slug
    } = loaderData;
    const ogImage = image ? image : `${baseUrl}/og?title=${encodeURIComponent(title)}`;
    return {
      meta: [{
        title: `${title} | Irreversible`
      }, {
        name: "description",
        content: description
      }, {
        property: "og:title",
        content: title
      }, {
        property: "og:description",
        content: description
      }, {
        property: "og:type",
        content: "article"
      }, {
        property: "article:published_time",
        content: publishedTime
      }, {
        property: "og:url",
        content: `${baseUrl}/blog/${slug}`
      }, {
        property: "og:image",
        content: ogImage
      }, {
        name: "twitter:card",
        content: "summary_large_image"
      }, {
        name: "twitter:title",
        content: title
      }, {
        name: "twitter:description",
        content: description
      }, {
        name: "twitter:image",
        content: ogImage
      }]
    };
  },
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SitemapRoute = Route$5.update({
  id: "/sitemap",
  path: "/sitemap",
  getParentRoute: () => Route$6
});
const RssRoute = Route$4.update({
  id: "/rss",
  path: "/rss",
  getParentRoute: () => Route$6
});
const OgRoute = Route$3.update({
  id: "/og",
  path: "/og",
  getParentRoute: () => Route$6
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$6
});
const BlogIndexRoute = Route$1.update({
  id: "/blog/",
  path: "/blog/",
  getParentRoute: () => Route$6
});
const BlogSlugRoute = Route.update({
  id: "/blog/$slug",
  path: "/blog/$slug",
  getParentRoute: () => Route$6
});
const rootRouteChildren = {
  IndexRoute,
  OgRoute,
  RssRoute,
  SitemapRoute,
  BlogSlugRoute,
  BlogIndexRoute
};
const routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  const router2 = createRouter({ routeTree, scrollRestoration: true });
  return router2;
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$2 as R,
  Route$1 as a,
  Route as b,
  baseUrl as c,
  router as r
};
