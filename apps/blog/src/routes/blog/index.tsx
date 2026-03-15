import { Link, createFileRoute } from "@tanstack/react-router";
import { blogs } from "../../lib/blogs";

export const Route = createFileRoute("/blog/")({
  component: Blog,
});

function Blog() {
  return (
    <main className="page-wrap px-4 py-14">
      <section className="grid gap-4">
        {blogs.map((post) => (
          <article key={post.slug} className="island-shell rounded-2xl p-5 sm:p-6">
            <p className="island-kicker mb-2">{post.publishedAt}</p>
            <h2 className="text-2xl font-semibold text-(--sea-ink)">
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="hover:underline decoration-[rgba(107,61,138,0.45)]"
              >
                {post.title}
              </Link>
            </h2>
            <p className="text-sm leading-7 text-(--sea-ink-soft)">{post.summary}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
