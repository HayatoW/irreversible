// @vitest-environment jsdom

import { cleanup, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { settle } from "@ui-sdk/core/testing";
import { createAgent } from "@ui-sdk/react/agent";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, test, vi } from "vite-plus/test";
import HomePage from "../../pages/index.tsx";
import BlogPostList from "./BlogPostList.tsx";

vi.mock("../lib/blogPosts.ts", () => ({ blogPosts: [] }));

declare global {
  var __UI_SDK_STRICT__: boolean | undefined;
}
globalThis.__UI_SDK_STRICT__ = true;

Element.prototype.scrollIntoView = () => {};
Element.prototype.checkVisibility = () => true;
Element.prototype.getClientRects = () => [] as unknown as DOMRectList;

const agent = createAgent();
const posts = ["first", "second", "third"].map((title) => ({
  title,
  description: "Post description",
  lang: "en",
  path: `/posts/${title}`,
  publishedAt: "2026-01-01",
}));

afterEach(cleanup);

test("the home page exposes its styled site title as a single heading", () => {
  render(<HomePage />);
  const headings = screen.getAllByRole("heading", { level: 1 });
  expect(headings).toEqual([screen.getByRole("heading", { level: 1, name: "Irreversible" })]);
  expect(headings[0]?.classList.contains("home-title")).toBe(true);
  expect(headings[0]?.textContent).toBe("Irreversible");
  expect(headings[0]?.querySelector('[aria-hidden="true"]')?.getAttribute("data-text")).toBe(
    "Irreversible",
  );
});

test("the home page exposes a labeled control for pausing the title effect", async () => {
  render(<HomePage />);
  const pause = screen.getByRole<HTMLInputElement>("checkbox", { name: "Pause title effect" });
  expect(pause.checked).toBe(false);
  await userEvent.setup().click(pause);
  expect(pause.checked).toBe(true);
});

test("renders post links on the server with one tab stop", () => {
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

test("arrow keys, Home and End move focus and the single tab stop", async () => {
  const user = userEvent.setup();
  render(<BlogPostList posts={posts} />);
  await act(settle);
  const links = screen.getAllByRole("link");
  await act(async () => links[0]!.focus());

  for (const [key, index] of [
    ["{ArrowDown}", 1],
    ["{ArrowUp}", 0],
    ["{End}", 2],
    ["{ArrowDown}", 2],
    ["{Home}", 0],
    ["{ArrowUp}", 0],
  ] as const) {
    await user.keyboard(key);
    expect(document.activeElement).toBe(links[index]);
    expect(links.map((link) => link.tabIndex)).toEqual(
      links.map((_, linkIndex) => (linkIndex === index ? 0 : -1)),
    );
  }

  await user.tab();
  expect(links).not.toContain(document.activeElement);
});

test("an empty list has no focusable links", async () => {
  render(<BlogPostList posts={[]} />);
  await act(settle);
  expect(screen.getByRole("list", { name: "Blog posts" })).toBeTruthy();
  expect(screen.queryAllByRole("link")).toHaveLength(0);
});

test("an agent can find the post list by name and focus it", async () => {
  render(
    <>
      <button type="button">Outside the list</button>
      <BlogPostList posts={posts} />
    </>,
  );
  await act(settle);
  const components = agent
    .snapshot()
    .filter((entry) => !entry.offPage && entry.component !== "more");
  for (const entry of components) {
    expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
  }
  expect(components.map((entry) => entry.label)).toContain("Blog posts");
  expect(components.find((entry) => entry.label === "Blog posts")?.actions).toContain("focus");

  const links = screen.getAllByRole("link");
  screen.getByRole("button", { name: "Outside the list" }).focus();
  const result = await act(() => agent.act({ steps: [{ ref: "Blog posts", action: "focus" }] }));
  expect(result.ok, result.error?.message).toBe(true);
  expect(document.activeElement).toBe(links[0]);
  expect(links.map((link) => link.tabIndex)).toEqual([0, -1, -1]);

  const refused = await agent.act({ steps: [{ ref: "Blog posts", action: "delete" }] });
  expect(refused.ok).toBe(false);
  expect(document.activeElement).toBe(links[0]);
});
