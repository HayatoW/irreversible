import * as fs from "node:fs";
import * as path from "node:path";

import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

// `app/blogs/` は本人が書く信頼できるコンテンツのため、iframe などの生 HTML はあえてサニタイズせずそのまま通す
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeStringify);

/**
 * ブログのフロントマター情報
 */
type BlogFrontMatter = {
  title: string;
  publishedAt: string;
  summary: string;
};

/**
 * ブログの完全な情報
 */
export type Blog = BlogFrontMatter & {
  /**
   * ブログを一意に識別する slug
   */
  slug: string;
  /**
   * フロントマターを除いた本文を HTML へ変換したもの
   */
  html: string;
};

/**
 * `app/blogs` ディレクトリ配下の Markdown ファイルを文字列で取得する
 */
const blogsDir = path.join(import.meta.dirname, "../blogs");
const blogModules: Record<string, string> = {};
for (const fileName of fs.readdirSync(blogsDir)) {
  if (!fileName.endsWith(".md")) {
    continue;
  }

  const filePath = path.join(blogsDir, fileName);
  blogModules[filePath] = fs.readFileSync(filePath, "utf8");
}

/**
 * YAML front matter の抽出に使う正規表現パターン
 *
 * 先頭の `---` から囲まれたブロック全体をキャプチャする
 */
const FRONT_MATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/**
 * Markdown の生データからフロントマター（メタデータ）と本文を抽出する
 *
 * @param rawContent - Markdownファイル全体の生テキスト（フロントマター込み）
 */
const parseFrontMatter = (
  rawContent: string,
): {
  frontMatter: BlogFrontMatter;
  content: string;
} => {
  const match = rawContent.match(FRONT_MATTER_PATTERN);
  if (!match) {
    throw new Error(
      "Failed to parse front matter: YAML front matter block not found in Markdown file.",
    );
  }

  const content = rawContent.slice(match[0].length).trim();

  const frontMatterText = match[1];
  const frontMatter = frontMatterText.split("\n").reduce<BlogFrontMatter>(
    (acc, line) => {
      const kvMatch = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
      if (!kvMatch) {
        return acc;
      }

      const key = kvMatch[1] as keyof BlogFrontMatter;
      const rawValue = kvMatch[2].trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");
      acc[key] = value;
      return acc;
    },
    { title: "", publishedAt: "", summary: "" },
  );

  return { frontMatter, content };
};

/**
 * 指定されたファイルパスからブログ記事の slug (拡張子を除いたファイル名) を抽出する
 *
 * @param filePath - 対象ファイルへのパス
 */
const pathToSlug = (filePath: string): string => {
  return path.basename(filePath, ".md");
};

/**
 * 指定されたファイルパスおよび Markdown の生テキストから Blog オブジェクトを生成する
 *
 * 1. ファイルパスから slug を抽出する
 * 2. フロントマターと本文をパースする
 * 3. 本文の Markdown を起動時に一度だけ HTML へ変換する
 *
 * @param filePath - 対象ファイルへのパス
 * @param rawContent - Markdown ファイルの生データ（フロントマター込み）
 * @returns Blog オブジェクト
 */
const toBlog = (filePath: string, rawContent: string): Blog => {
  const { frontMatter, content } = parseFrontMatter(rawContent);
  const slug = pathToSlug(filePath);
  const html = String(processor.processSync(content));

  return {
    slug,
    title: frontMatter.title,
    publishedAt: frontMatter.publishedAt,
    summary: frontMatter.summary,
    html,
  };
};

/**
 * すべてのブログ記事を `Blog[]` 配列として取得する
 *
 * - `publishedAt` (公開日) の降順で並び替えられています。
 */
export const blogs: Blog[] = Object.entries(blogModules)
  .map(([filePath, rawContent]) => {
    try {
      return toBlog(filePath, rawContent);
    } catch (error) {
      throw new Error(`Failed to load blog "${path.basename(filePath)}"`, { cause: error });
    }
  })
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

/**
 * 指定されたスラッグ（slug）に対応するブログ記事を取得する
 *
 * @param slug - 取得したいブログ記事のスラッグ
 * @returns 見つかった場合は Blog オブジェクト、見つからない場合は undefined
 */
export const getBlogBySlug = (slug: string): Blog | undefined =>
  blogs.find((blog) => blog.slug === slug);
