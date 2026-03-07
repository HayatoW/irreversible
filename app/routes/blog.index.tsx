import { createFileRoute } from '@tanstack/react-router'
import { getBlogPosts } from 'app/blog/posts'
import { BlogPosts } from 'app/components/posts'
import { siteTitle } from 'app/config'

export const Route = createFileRoute('/blog/')({
  loader: () => getBlogPosts(),
  head: () => ({
    meta: [
      { title: `Blog | ${siteTitle}` },
      { name: 'description', content: 'Read my blog.' },
      { property: 'og:title', content: 'Blog' },
      { property: 'og:description', content: 'Read my blog.' },
    ],
  }),
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
