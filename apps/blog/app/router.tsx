import { createRouter, type MiddlewareContext } from "remix/router";
import { render } from "remix/middleware/render";
import { staticFiles } from "remix/middleware/static";

import blogController from "./actions/blog/controller.tsx";
import controller from "./actions/controller.tsx";
import { Document } from "./actions/document.tsx";
import { assets } from "./assets.ts";
import { routes } from "./routes.ts";
import { NotFoundPage } from "./ui/not-found.tsx";

const renderMiddleware = render({ assets });
type AppContext = MiddlewareContext<[typeof renderMiddleware]>;

declare module "remix" {
  interface RouterTypes {
    context: AppContext;
  }
}

export const router = createRouter<AppContext>({
  middleware: [staticFiles("./public", { index: false }), renderMiddleware],
  defaultHandler: (context) =>
    context.render(
      <Document title="Not Found">
        <NotFoundPage />
      </Document>,
      { status: 404 },
    ),
});

router.map(routes, controller);
router.map(routes.blog, blogController);
