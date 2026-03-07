import { createFileRoute } from '@tanstack/react-router'
import { getBlogPosts } from 'app/blog/posts'
import { baseUrl, siteTitle } from 'app/config'

export const Route = createFileRoute('/rss')({
  server: {
    handlers: {
      GET: async () => {
        const allBlogs = await getBlogPosts()

        const itemsXml = allBlogs
          .map(
            (post) => `<item>
          <title>${escapeXml(post.metadata.title)}</title>
          <link>${baseUrl}/blog/${post.slug}</link>
          <description>${escapeXml(post.metadata.summary || '')}</description>
          <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
        </item>`,
          )
          .join('\n')

        const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${siteTitle}</title>
    <link>${baseUrl}</link>
    <description>This is my portfolio RSS feed</description>
    ${itemsXml}
  </channel>
</rss>`

        return new Response(rssFeed, {
          headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
          },
        })
      },
    },
  },
})

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}
