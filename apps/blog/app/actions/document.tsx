import type { Handle, RemixNode } from "remix/component";
import { ImportMap } from "remix/component/server";

import { scriptEntry, styleHref } from "../assets.ts";
import { Footer } from "../ui/footer.tsx";
import { Header } from "../ui/header.tsx";

export interface DocumentProps {
  children?: RemixNode;
  title?: string;
  description?: string;
}

export function Document(handle: Handle<DocumentProps>) {
  return () => {
    let { children, title, description } = handle.props;
    let { href, importMap, preloads } = scriptEntry;

    return (
      <html lang="ja">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{title ? `${title} | Irreversible` : "Irreversible"}</title>
          {description ? <meta name="description" content={description} /> : null}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+JP:wght@400;700&display=swap"
          />
          <link rel="stylesheet" href={styleHref} />
          <ImportMap value={importMap} />
          {preloads.map((preloadHref) => (
            <link key={preloadHref} rel="modulepreload" href={preloadHref} />
          ))}
          <script type="module" src={href}></script>
        </head>
        <body>
          <Header />
          {children}
          <Footer />
        </body>
      </html>
    );
  };
}
