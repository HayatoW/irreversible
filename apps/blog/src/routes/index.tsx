import { Link, createFileRoute } from "@tanstack/react-router";
import { blogs } from "../lib/blogs";

export const Route = createFileRoute("/")({ component: App });
const LATEST_BLOGS_LIMIT = 4;

function App() {
  const latestBlogs = blogs.slice(0, LATEST_BLOGS_LIMIT);

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-4xl px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(180,140,200,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(107,61,138,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">blog</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-(--sea-ink) sm:text-6xl">
          Irreversible
        </h1>
        <p className="mb-8 max-w-2xl text-base text-(--sea-ink-soft) sm:text-lg">
          Hello Friend. I build software and share my place with two cats. When I'm not coding, I'm
          usually listening to These New Puritans or Nils Frahm, or thinking about design—especially
          ACRNM's take on function and form.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {latestBlogs.map((post, index) => (
          <article
            key={post.slug}
            className="island-shell feature-card rise-in rounded-2xl p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <p className="island-kicker mb-2">{post.publishedAt}</p>
            <h2 className="mb-2 text-base font-semibold text-(--sea-ink)">
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="hover:underline decoration-[rgba(107,61,138,0.45)]"
              >
                {post.title}
              </Link>
            </h2>
            <p className="text-sm text-(--sea-ink-soft)">{post.summary}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
