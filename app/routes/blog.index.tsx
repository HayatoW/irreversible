import { createFileRoute } from '@tanstack/react-router'
import { fetchBlogPosts } from '../blog/server'
import { BlogPosts } from '../components/posts'

export const Route = createFileRoute('/blog/')({
  head: () => ({
    meta: [
      { title: 'Blog | Irreversible' },
      { name: 'description', content: 'Read my blog.' },
    ],
  }),
  loader: () => fetchBlogPosts(),
  component: BlogIndexPage,
})

function BlogIndexPage() {
  const posts = Route.useLoaderData()
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Blog</h1>
      <BlogPosts posts={posts} />
    </section>
  )
}
