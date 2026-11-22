import { blogPosts } from "../../src/lib/blogPosts.ts";
import BlogPostList from "../../src/ui/BlogPostList.tsx";

export const layout = "!portfolio";

export default function PostsPage() {
  return (
    <>
      <h1 className="font-artemis text-4xl font-bold tracking-tight">Post</h1>
      <section aria-labelledby="all-posts" className="mt-8">
        <h2 className="sr-only" id="all-posts">
          All posts
        </h2>
        <BlogPostList posts={blogPosts} />
      </section>
    </>
  );
}
