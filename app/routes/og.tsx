import { createFileRoute } from '@tanstack/react-router'
import { ImageResponse } from '@vercel/og'
import { siteTitle } from 'app/config'

export const Route = createFileRoute('/og')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const title = url.searchParams.get('title') || siteTitle

        return new ImageResponse(
          (
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                background: '#ffffff',
                padding: '48px',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <h1
                style={{
                  fontSize: 72,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: '#111111',
                  textAlign: 'center',
                }}
              >
                {title}
              </h1>
            </div>
          ),
          {
            width: 1200,
            height: 630,
          },
        )
      },
    },
  },
})
