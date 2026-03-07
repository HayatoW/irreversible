import { createFileRoute } from '@tanstack/react-router'
import { getBlogPosts } from '../blog/utils'
import { baseUrl } from '../config'

export const Route = createFileRoute('/sitemap')({
  component: () => null,
  server: {
    handlers: {
      GET: async () => {
        const blogs = getBlogPosts().map((post) => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: post.metadata.publishedAt,
        }))

        const routes = ['', '/blog'].map((route) => ({
          url: `${baseUrl}${route}`,
          lastModified: new Date().toISOString().split('T')[0],
        }))

        const allUrls = [...routes, ...blogs]

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    ({ url, lastModified }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>`

        return new Response(xml, {
          headers: { 'Content-Type': 'application/xml' },
        })
      },
    },
  },
})
