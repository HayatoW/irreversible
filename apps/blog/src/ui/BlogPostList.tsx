import type { blogPosts } from "../lib/blogPosts.ts";

export default function BlogPostList({ posts }: { posts: typeof blogPosts }) {
  return (
    <ul className="space-y-4">
      {posts.map(({ description, lang, path, publishedAt, title }) => (
        <li key={path}>
          <a
            className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[CanvasText]"
            href={path}
          >
            <article
              className="rounded-xl border border-border bg-card p-5 group-active:border-foreground"
              lang={lang}
            >
              <time className="text-sm text-muted-foreground" dateTime={publishedAt}>
                {publishedAt}
              </time>
              <h3 className="mt-1 text-xl font-semibold underline-offset-4 group-hover:underline group-focus-visible:underline">
                {title}
              </h3>
              <p className="mt-1 text-muted-foreground">{description}</p>
            </article>
          </a>
        </li>
      ))}
    </ul>
  );
}
