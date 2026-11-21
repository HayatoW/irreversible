import type { blogPosts } from "../lib/blogPosts.ts";

export default function BlogPostList({ posts }: { posts: typeof blogPosts }) {
  return (
    <ul className="space-y-4">
      {posts.map(({ description, lang, path, publishedAt, title }) => (
        <li className="rounded-xl border border-border bg-card p-5" key={path}>
          <article lang={lang}>
            <time className="text-sm text-muted-foreground" dateTime={publishedAt}>
              {publishedAt}
            </time>
            <h3 className="mt-1 text-xl font-semibold">
              <a className="underline-offset-4 hover:underline" href={path}>
                {title}
              </a>
            </h3>
            <p className="mt-1 text-muted-foreground">{description}</p>
          </article>
        </li>
      ))}
    </ul>
  );
}
