import { createFileRoute, notFound } from '@tanstack/react-router'
import { fetchBlogPost } from '../blog/server'
import { formatDate } from '../blog/format'
import { baseUrl } from '../config'
import { CustomMDX } from '../components/mdx'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const post = await fetchBlogPost({ data: params.slug })
    if (!post) throw notFound()
    return post
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { title, publishedAt, summary, image, slug } = loaderData
    const ogImage = image
      ? image
      : `${baseUrl}/og?title=${encodeURIComponent(title)}`
    return {
      meta: [
        { title: `${title} | Irreversible` },
        { name: 'description', content: summary },
        { property: 'og:title', content: title },
        { property: 'og:description', content: summary },
        { property: 'og:type', content: 'article' },
        { property: 'og:publishedTime', content: publishedAt },
        { property: 'og:url', content: `${baseUrl}/blog/${slug}` },
        { property: 'og:image', content: ogImage },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: summary },
        { name: 'twitter:image', content: ogImage },
      ],
    }
  },
  component: BlogPostPage,
})

function BlogPostPage() {
  const { title, publishedAt, summary, image, slug, code } =
    Route.useLoaderData()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    datePublished: publishedAt,
    dateModified: publishedAt,
    description: summary,
    image: image
      ? `${baseUrl}${image}`
      : `/og?title=${encodeURIComponent(title)}`,
    url: `${baseUrl}/blog/${slug}`,
    author: { '@type': 'Person', name: 'Hayato Watanabe' },
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="title font-semibold text-2xl tracking-tighter">{title}</h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatDate(publishedAt)}
        </p>
      </div>
      <article className="prose">
        <CustomMDX code={code} />
      </article>
    </section>
  )
}
