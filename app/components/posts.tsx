import { Link } from '@tanstack/react-router'
import { formatDate, sortBlogPosts, type BlogPostSummary } from 'app/blog/utils'

type BlogPostsProps = {
  posts: BlogPostSummary[]
}

export function BlogPosts({ posts }: BlogPostsProps) {
  return (
    <div>
      {sortBlogPosts(posts).map((post) => (
          <Link
            key={post.slug}
            className="flex flex-col space-y-1 mb-4"
            to="/blog/$slug"
            params={{ slug: post.slug }}
          >
            <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
              <p className="text-neutral-600 dark:text-neutral-400 w-[100px] tabular-nums">
                {formatDate(post.metadata.publishedAt, false)}
              </p>
              <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
                {post.metadata.title}
              </p>
            </div>
          </Link>
        ))}
    </div>
  )
}
