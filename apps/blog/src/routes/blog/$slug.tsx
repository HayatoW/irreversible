import { createFileRoute, notFound } from "@tanstack/react-router";
import Markdown from "../../components/Markdown";
import { getBlogBySlug } from "../../lib/blogs";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getBlogBySlug(params.slug);
    if (!post) {
      throw notFound();
    }
    return post;
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const post = Route.useLoaderData();

  return (
    <main className="page-wrap px-4 py-14">
      <article className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">{post.publishedAt}</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-(--sea-ink) sm:text-5xl">
          {post.title}
        </h1>
        <p className="m-0 text-(--sea-ink-soft)">{post.summary}</p>
        <Markdown
          content={post.content}
          className="prose prose-slate prose-headings:text-(--sea-ink) prose-p:text-(--sea-ink-soft) prose-strong:text-(--sea-ink) mt-8 max-w-none"
        />
      </article>
    </main>
  );
}
