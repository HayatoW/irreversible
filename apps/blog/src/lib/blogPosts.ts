import pages from "@void/md/pages";

export const blogPosts = pages
  .flatMap(({ frontmatter, path, title }) => {
    const { description, lang, publishedAt } = frontmatter;
    return path.startsWith("/posts/") &&
      typeof description === "string" &&
      typeof publishedAt === "string"
      ? [
          {
            description,
            lang: typeof lang === "string" ? lang : undefined,
            path,
            publishedAt,
            title,
          },
        ]
      : [];
  })
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
