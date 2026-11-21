import "@void/md/theme-content.css";
import { useFrontmatter } from "@void/md";
import type { ReactNode } from "react";
import PortfolioLayout from "./portfolio.tsx";

export default function ArticleLayout({ children }: { children: ReactNode }) {
  const { description, lang, publishedAt, title } = useFrontmatter();

  return (
    <PortfolioLayout>
      <article lang={typeof lang === "string" ? lang : undefined}>
        <header className="mb-8 space-y-3">
          {typeof publishedAt === "string" && (
            <time className="text-sm text-muted-foreground" dateTime={publishedAt}>
              {publishedAt}
            </time>
          )}
          {typeof title === "string" && (
            <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          )}
          {typeof description === "string" && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </header>
        <div className="void-md">{children}</div>
      </article>
    </PortfolioLayout>
  );
}
