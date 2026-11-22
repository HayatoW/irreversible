import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vite-plus/test";
import BlogPostList from "./BlogPostList.tsx";

test("renders post links on the server with one tab stop", () => {
  const posts = ["first", "second"].map((title) => ({
    title,
    description: "Post description",
    lang: "en",
    path: `/posts/${title}`,
    publishedAt: "2026-01-01",
  }));
  const html = renderToStaticMarkup(<BlogPostList posts={posts} />);
  expect(html).toContain('aria-label="Blog posts"');
  expect(html.match(/tabindex="0"/g)).toHaveLength(1);
  expect(html.match(/tabindex="-1"/g)).toHaveLength(posts.length - 1);
  for (const post of posts) expect(html).toContain(`href="${post.path}"`);
});

test("renders an empty list without a tab stop", () => {
  const html = renderToStaticMarkup(<BlogPostList posts={[]} />);
  expect(html).toContain('aria-label="Blog posts"');
  expect(html).not.toContain("tabindex");
  expect(html).not.toContain("<a");
});
