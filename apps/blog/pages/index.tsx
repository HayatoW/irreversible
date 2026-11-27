import { blogPosts } from "../src/lib/blogPosts.ts";
import BlogPostList from "../src/ui/BlogPostList.tsx";

export const layout = "!portfolio";

export default function HomePage() {
  return (
    <>
      <h1 className="home-title">Irreversible</h1>
      <p className="mt-5 max-w-prose text-lg text-muted-foreground">
        Hello Friend. I build software and share my place with two cats. When I'm not coding, I'm
        usually listening to These New Puritans or Nils Frahm, or thinking about design—especially
        ACRNM's take on function and form.
      </p>
      <section aria-labelledby="latest-posts" className="mt-12">
        <h2 className="mb-4 text-2xl font-semibold" id="latest-posts">
          Latest posts
        </h2>
        <BlogPostList posts={blogPosts.slice(0, 4)} />
      </section>
    </>
  );
}
