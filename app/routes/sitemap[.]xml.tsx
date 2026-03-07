import { createFileRoute } from '@tanstack/react-router'
import { getBlogPosts } from 'app/blog/posts'
import { baseUrl } from 'app/config'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const blogs = await getBlogPosts()
        const lastModified = new Date().toISOString().split('T')[0]
        const urls = [
          { url: `${baseUrl}/`, lastModified },
          { url: `${baseUrl}/blog`, lastModified },
          ...blogs.map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.metadata.publishedAt,
          })),
        ]

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>`

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
          },
        })
      },
    },
  },
})
