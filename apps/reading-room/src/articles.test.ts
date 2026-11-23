import { describe, expect, it } from "vite-plus/test";
import { articles, parseArticle } from "./articles";

describe("blog source articles", () => {
  it("reads both real posts without maintaining duplicate article copy", () => {
    expect(articles.neon.title).toBe("Neon");
    expect(articles.neon.date).toBe("2026-02-26");
    expect(articles.neon.blocks.filter((block) => block.type === "heading")).toHaveLength(2);
    expect(articles["last-train-home"].title).toBe("Last Train Home");
    expect(
      articles["last-train-home"].blocks.filter((block) => block.type === "heading"),
    ).toHaveLength(3);
  });

  it("preserves Japanese text and explicit line breaks, replacing embeds with safe links", () => {
    const article = parseArticle(
      '---\ntitle: "Example"\npublishedAt: "2026-01-01"\n---\n\n日本語<br/>次の行\n\n<iframe src="https://www.youtube-nocookie.com/embed/test-123"></iframe>',
    );
    expect(article.blocks).toEqual([
      { type: "paragraph", text: "日本語\n次の行" },
      {
        type: "media",
        title: "Example — YouTube ↗",
        url: "https://www.youtube.com/watch?v=test-123",
      },
    ]);
  });

  it("does not turn arbitrary markup or iframe URLs into executable content", () => {
    const article = parseArticle(
      '---\ntitle: "<script>alert(1)</script>"\n---\n\n<img src=x onerror=alert(1)>\n\n<iframe src="javascript:alert(1)"></iframe>',
    );
    expect(article.title).toBe("<script>alert(1)</script>");
    expect(article.blocks).toEqual([{ type: "paragraph", text: "<img src=x onerror=alert(1)>" }]);
  });
});
