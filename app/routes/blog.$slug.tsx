import { createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { compile } from '@mdx-js/mdx'
import { CustomMDX } from 'app/components/mdx'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { baseUrl } from 'app/config'

const baseServerFn = createServerFn({ method: 'GET' })
const serverFnWithValidator = baseServerFn as typeof baseServerFn & {
  validator?: typeof baseServerFn.inputValidator
}

const fetchPost = (
  serverFnWithValidator.validator?.((slug: string) => slug) ??
  serverFnWithValidator.inputValidator((slug: string) => slug)
).handler(async ({ data: slug }) => {
  const post = getBlogPosts().find((p) => p.slug === slug)
  if (!post) return null
  const code = String(
    await compile(post.content, { outputFormat: 'function-body' })
  )
  return { metadata: post.metadata, slug: post.slug, code }
})

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const data = await fetchPost({ data: params.slug })
    if (!data) {
      throw notFound()
    }
    return data
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const {
      metadata: {
        title,
        publishedAt: publishedTime,
        summary: description,
        image,
      },
      slug,
    } = loaderData
    const ogImage = image
      ? image
      : `${baseUrl}/og?title=${encodeURIComponent(title)}`

    return {
      meta: [
        { title: `${title} | Irreversible` },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'article:published_time', content: publishedTime },
        { property: 'og:url', content: `${baseUrl}/blog/${slug}` },
        { property: 'og:image', content: ogImage },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: ogImage },
      ],
    }
  },
  component: BlogPost,
})

function BlogPost() {
  const { metadata, slug, code } = Route.useLoaderData()
  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: metadata.title,
            datePublished: metadata.publishedAt,
            dateModified: metadata.publishedAt,
            description: metadata.summary,
            image: metadata.image
              ? `${baseUrl}${metadata.image}`
              : `/og?title=${encodeURIComponent(metadata.title)}`,
            url: `${baseUrl}/blog/${slug}`,
            author: {
              '@type': 'Person',
              name: 'Hayato Watanabe',
            },
          }),
        }}
      />
      <h1 className="title font-semibold text-2xl tracking-tighter">
        {metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatDate(metadata.publishedAt)}
        </p>
      </div>
      <article className="prose">
        <CustomMDX code={code} />
      </article>
    </section>
  )
}
