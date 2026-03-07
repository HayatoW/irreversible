import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { BlogPosts } from 'app/components/posts'
import { getBlogPosts } from 'app/blog/utils'

const fetchPosts = createServerFn().handler(() => {
  return getBlogPosts().map(({ content, ...rest }) => rest)
})

export const Route = createFileRoute('/blog/')({
  head: () => ({
    meta: [
      { title: 'Blog | Irreversible' },
      { name: 'description', content: 'Read my blog.' },
    ],
  }),
  loader: async () => {
    return { posts: await fetchPosts() }
  },
  component: BlogPage,
})

function BlogPage() {
  const { posts } = Route.useLoaderData()
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Blog</h1>
      <BlogPosts posts={posts} />
    </section>
  )
}
