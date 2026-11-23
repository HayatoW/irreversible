import neon from "../../blog/pages/posts/neon.md?raw";
import lastTrainHome from "../../blog/pages/posts/last-train-home.md?raw";

export type Block =
  | { type: "paragraph" | "heading"; text: string }
  | { type: "media"; title: string; url: string };
export interface Article {
  title: string;
  date: string;
  description: string;
  blocks: Block[];
}

// A deliberately small, text-only reader for our two local posts. Never insert
// Markdown as HTML: even metadata and unsupported markup remain inert text.
export function parseArticle(markdown: string): Article {
  const [, frontmatter = "", body = ""] = markdown.split(/^---\s*$/m);
  const field = (name: string) =>
    frontmatter.match(new RegExp(`^${name}: *["']?(.*?)["']?$`, "m"))?.[1] ?? "";
  const blocks: Block[] = [];
  for (const part of body.trim().split(/\n\s*\n/)) {
    const text = part.trim();
    if (!text) continue;
    if (text.startsWith("<iframe")) {
      // Keep the article's media reference without placing video inside the
      // text-comparison surface or loading an unsolicited third-party embed.
      const video = text.match(/https:\/\/www\.youtube-nocookie\.com\/embed\/([\w-]+)/)?.[1];
      if (video)
        blocks.push({
          type: "media",
          title: `${field("title")} — YouTube ↗`,
          url: `https://www.youtube.com/watch?v=${video}`,
        });
    } else {
      blocks.push({
        type: text.startsWith("## ") ? "heading" : "paragraph",
        text: text.replace(/^## /, "").replace(/<br\s*\/?>\s*/g, "\n"),
      });
    }
  }
  return {
    title: field("title"),
    date: field("publishedAt"),
    description: field("description"),
    blocks,
  };
}

export const articles = {
  neon: parseArticle(neon),
  "last-train-home": parseArticle(lastTrainHome),
};

export function renderArticle(article: Article, target: HTMLElement, contents: HTMLElement): void {
  target.replaceChildren();
  contents.replaceChildren();
  const kicker = document.createElement("p");
  kicker.className = "post-kicker";
  kicker.textContent = `HAYATOW — ${article.date.replaceAll("-", ".")}`;
  const title = document.createElement("h2");
  title.className = "post-title";
  title.lang = "en";
  title.textContent = article.title;
  const description = document.createElement("p");
  description.className = "post-description";
  description.textContent = article.description;
  const body = document.createElement("div");
  body.className = "post-body";
  let index = 0;
  for (const block of article.blocks) {
    if (block.type === "media") {
      const link = document.createElement("a");
      link.href = block.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = block.title;
      const note = document.createElement("p");
      note.className = "media-note";
      note.append(link);
      body.append(note);
      continue;
    }
    const element = document.createElement(block.type === "heading" ? "h3" : "p");
    element.textContent = block.text;
    element.style.whiteSpace = "pre-line";
    if (block.type === "heading") {
      element.id = `section-${++index}`;
      const link = document.createElement("a");
      link.href = `#${element.id}`;
      link.textContent = block.text;
      contents.append(link);
    }
    body.append(element);
  }
  target.append(kicker, title, description, body);
}
