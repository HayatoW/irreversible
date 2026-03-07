import { createFileRoute, notFound } from '@tanstack/react-router'
import { getBlogPost } from 'app/blog/posts'
import { formatDate } from 'app/blog/utils'
import { CustomMDX } from 'app/components/mdx'
import { baseUrl, siteTitle } from 'app/config'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const post = await getBlogPost({ data: { slug: params.slug } })

    if (!post) {
      throw notFound({ throw: true })
    }

    return post
  },
  head: ({ loaderData }) => {
    const title = loaderData?.metadata.title
    const description = loaderData?.metadata.summary ?? ''
    const ogImage = loaderData?.metadata.image
      ? toAbsoluteUrl(loaderData.metadata.image)
      : `${baseUrl}/og?title=${encodeURIComponent(title ?? siteTitle)}`

    return {
      meta: [
        { title: title ? `${title} | ${siteTitle}` : siteTitle },
        { name: 'description', content: description },
        { property: 'og:title', content: title ?? siteTitle },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: title ? `${baseUrl}/blog/${loaderData?.slug}` : baseUrl },
        { property: 'og:image', content: ogImage },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title ?? siteTitle },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: ogImage },
      ],
    }
  },
  component: BlogPostPage,
})

function BlogPostPage() {
  const post = Route.useLoaderData()

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? toAbsoluteUrl(post.metadata.image)
              : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/blog/${post.slug}`,
            author: {
              '@type': 'Person',
              name: 'Hayato Watanabe',
            },
          }),
        }}
      />
      <h1 className="title font-semibold text-2xl tracking-tighter">
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatDate(post.metadata.publishedAt)}
        </p>
      </div>
      <article className="prose">
        <CustomMDX code={post.code} />
      </article>
    </section>
  )
}

function toAbsoluteUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  return `${baseUrl}${url}`
}
