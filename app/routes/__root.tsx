import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { Navbar } from 'app/components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Footer from 'app/components/footer'
import { baseUrl } from 'app/config'
import appCss from 'app/global.css?url'
import fontsNoto from '@fontsource-variable/noto-sans-jp/index.css?url'
import fontsGeistMono from '@fontsource/geist-mono/index.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Irreversible' },
      { name: 'description', content: 'This is my portfolio.' },
      { property: 'og:title', content: 'Irreversible' },
      { property: 'og:description', content: 'This is my portfolio.' },
      { property: 'og:url', content: baseUrl },
      { property: 'og:site_name', content: 'Irreversible' },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:type', content: 'website' },
      { name: 'robots', content: 'index, follow' },
      {
        name: 'googlebot',
        content:
          'index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1',
      },
    ],
    links: [
      { rel: 'stylesheet', href: fontsNoto },
      { rel: 'stylesheet', href: fontsGeistMono },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootLayout,
  notFoundComponent: NotFound,
})

function NotFound() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        404 - Page Not Found
      </h1>
      <p className="mb-4">The page you are looking for does not exist.</p>
    </section>
  )
}

function RootLayout() {
  return (
    <html
      lang="ja"
      className="text-black bg-white dark:text-white dark:bg-black font-sans"
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
