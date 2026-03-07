import type { ReactNode } from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Navbar } from 'app/components/nav'
import Footer from 'app/components/footer'
import { baseUrl, siteDescription, siteTitle } from 'app/config'
import '../global.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: siteTitle },
      { name: 'description', content: siteDescription },
      { property: 'og:title', content: siteTitle },
      { property: 'og:description', content: siteDescription },
      { property: 'og:url', content: baseUrl },
      { property: 'og:site_name', content: siteTitle },
      { property: 'og:locale', content: 'ja_JP' },
      { property: 'og:type', content: 'website' },
      {
        name: 'robots',
        content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
      },
      {
        name: 'googlebot',
        content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
      },
    ],
    links: [
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: `${siteTitle} RSS Feed`,
        href: `${baseUrl}/rss`,
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
        <Navbar />
        <Outlet />
        <Footer />
        <Analytics />
        <SpeedInsights />
      </main>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className="text-black bg-white dark:text-white dark:bg-black">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased max-w-xl mx-4 mt-8 lg:mx-auto">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundComponent() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        404 - Page Not Found
      </h1>
      <p className="mb-4">The page you are looking for does not exist.</p>
    </section>
  )
}
