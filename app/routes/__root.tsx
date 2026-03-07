import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import * as React from 'react'
import { Navbar } from '../components/nav'
import Footer from '../components/footer'
import '../global.css'
import '@fontsource-variable/noto-sans-jp'
import '@fontsource/geist-mono'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Irreversible' },
      { name: 'description', content: 'This is my portfolio.' },
      { property: 'og:title', content: 'Irreversible' },
      { property: 'og:description', content: 'This is my portfolio.' },
      { property: 'og:site_name', content: 'Irreversible' },
      { property: 'og:type', content: 'website' },
      { name: 'robots', content: 'index, follow' },
    ],
  }),
  notFoundComponent: () => (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        404 - Page Not Found
      </h1>
      <p className="mb-4">The page you are looking for does not exist.</p>
    </section>
  ),
  component: RootLayout,
})

function RootLayout() {
  return (
    <html
      lang="ja"
      className="text-black bg-white dark:text-white dark:bg-black"
      style={{ fontFamily: "'Noto Sans JP Variable', 'Geist Mono', sans-serif" }}
    >
      <head>
        <HeadContent />
      </head>
      <body className="antialiased max-w-xl mx-4 mt-8 lg:mx-auto">
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
          <Navbar />
          <Outlet />
          <Footer />
          <Analytics />
          <SpeedInsights />
        </main>
        <Scripts />
      </body>
    </html>
  )
}
