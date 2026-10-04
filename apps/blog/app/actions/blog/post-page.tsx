import type { Handle } from "remix/component";
import { css } from "remix/component";

import type { Blog } from "../../lib/blogs.ts";
import { blogs } from "../../lib/blogs.ts";
import { routes } from "../../routes.ts";
import { Markdown } from "../../ui/markdown.tsx";
import { containerCss, labelCss, panelCss } from "../../ui/styles.ts";

export interface BlogPostPageProps {
  post: Blog;
}

const mainCss = css({
  paddingBlock: "3.5rem",
});

const backCss = css({
  display: "inline-flex",
  alignItems: "center",
  minHeight: "44px",
  paddingInline: "1.3rem",
  borderRadius: "var(--radius-pill)",
  border: "1px solid var(--color-line)",
  background: "var(--color-panel)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.8), 0 1px 2px rgba(29,28,26,.08)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.72rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--color-ink)",
  textDecoration: "none",
  transition: "transform 160ms ease",
  "&:hover": {
    color: "var(--color-accent)",
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(0)",
    boxShadow: "inset 0 2px 6px rgba(29,28,26,.18)",
  },
});

const metaCss = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem 2rem",
  marginTop: "2.4rem",
  paddingBlock: "0.9rem",
  borderBlock: "1px solid var(--color-line)",
});

const titleCss = css({
  margin: "1rem 0 0",
  fontFamily: "var(--font-display)",
  fontSize: "clamp(2.2rem, 6vw, 3.4rem)",
  fontWeight: 700,
  letterSpacing: "-0.02em",
  lineHeight: 1.15,
});

const summaryCss = css({
  margin: "1.2rem 0 0",
  maxWidth: "36em",
  fontSize: "1.05rem",
  lineHeight: 1.85,
  color: "var(--color-muted)",
});

const articleCss = css({
  marginTop: "2.8rem",
  padding: "clamp(1.4rem, 4vw, 2.6rem)",
  animation: "rise 700ms cubic-bezier(0.16, 1, 0.3, 1) 120ms both",
});

export function BlogPostPage(handle: Handle<BlogPostPageProps>) {
  return () => {
    let { post } = handle.props;
    let entryNo = String(blogs.findIndex((b) => b.slug === post.slug) + 1).padStart(2, "0");

    return (
      <main mix={[containerCss, mainCss]}>
        <a href={routes.home.href()} mix={backCss}>
          &larr; Index
        </a>

        <div mix={metaCss}>
          <span mix={labelCss}>Entry {entryNo}</span>
          <span mix={labelCss}>Published {post.publishedAt}</span>
        </div>

        <h1 mix={titleCss}>{post.title}</h1>
        <p mix={summaryCss}>{post.summary}</p>

        <article mix={[panelCss, articleCss]}>
          <Markdown html={post.html} />
        </article>
      </main>
    );
  };
}
