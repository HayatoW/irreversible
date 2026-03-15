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
   * フロントマターを除いた Markdown 本文
   */
  content: string;
};

/**
 * 各ブログファイルの内容を `raw` クエリとして文字列で取得する
 */
const blogModules = import.meta.glob<true, string, string>("../blogs/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

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
 * @param path - 対象ファイルへのパス
 */
const pathToSlug = (path: string): string => {
  const fileName = path.split("/").pop() ?? "";
  return fileName.replace(/\.md$/i, "");
};

/**
 * 指定されたファイルパスおよび Markdown の生テキストから Blog オブジェクトを生成する
 *
 * 1. ファイルパスから slug を抽出する
 * 2. フロントマターと本文をパースする
 * 3. Markdown 内部の HTML 属性を React (JSX) 向けから通常の HTML 属性名に正規化する
 *
 * @param path - 対象ファイルへのパス
 * @param rawContent - Markdown ファイルの生データ（フロントマター込み）
 * @returns Blog オブジェクト
 */
const toBlog = (path: string, rawContent: string): Blog => {
  const { frontMatter, content } = parseFrontMatter(rawContent);
  const slug = pathToSlug(path);
  const normalizedContent = content
    .replaceAll("className=", "class=")
    .replaceAll("frameBorder=", "frameborder=")
    .replaceAll("referrerPolicy=", "referrerpolicy=")
    .replaceAll("allowFullScreen", "allowfullscreen");

  return {
    slug,
    title: frontMatter.title,
    publishedAt: frontMatter.publishedAt,
    summary: frontMatter.summary,
    content: normalizedContent,
  };
};

/**
 * すべてのブログ記事を `Blog[]` 配列として取得する
 *
 * - `publishedAt` (公開日) の降順で並び替えられています。
 */
export const blogs: Blog[] = Object.entries(blogModules)
  .map(([path, rawContent]) => toBlog(path, rawContent))
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

/**
 * 指定されたスラッグ（slug）に対応するブログ記事を取得する
 *
 * @param slug - 取得したいブログ記事のスラッグ
 * @returns 見つかった場合は Blog オブジェクト、見つからない場合は undefined
 */
export const getBlogBySlug = (slug: string): Blog | undefined =>
  blogs.find((blog) => blog.slug === slug);
