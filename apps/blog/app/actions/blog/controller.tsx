import { redirect } from "remix/response/redirect";
import { createController } from "remix/router";

import { getBlogBySlug } from "../../lib/blogs.ts";
import { routes } from "../../routes.ts";
import { NotFoundPage } from "../../ui/not-found.tsx";
import { Document } from "../document.tsx";
import { BlogPostPage } from "./post-page.tsx";

export default createController(routes.blog, {
  actions: {
    index() {
      return redirect(routes.home.href(), 301);
    },
    show(context) {
      let post = getBlogBySlug(context.params.slug);
      if (!post) {
        return context.render(
          <Document title="Not Found">
            <NotFoundPage />
          </Document>,
          { status: 404 },
        );
      }

      return context.render(
        <Document title={post.title} description={post.summary}>
          <BlogPostPage post={post} />
        </Document>,
      );
    },
  },
});
