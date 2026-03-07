import { createFileRoute } from '@tanstack/react-router'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync } from 'fs'

const FONT_PATH = '/usr/share/fonts/truetype/croscore/Arimo-Bold.ttf'

export const Route = createFileRoute('/og')({
  component: () => null,
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url)
        const title = url.searchParams.get('title') || 'Irreversible'

        const fontData = readFileSync(FONT_PATH)

        const svg = await satori(
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              padding: '48px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <h2
                style={{
                  fontSize: '64px',
                  fontWeight: 700,
                  color: '#000',
                  letterSpacing: '-0.025em',
                  margin: 0,
                }}
              >
                {title}
              </h2>
            </div>
          </div>,
          {
            width: 1200,
            height: 630,
            fonts: [
              {
                name: 'Arimo',
                data: fontData,
                weight: 700,
                style: 'normal',
              },
            ],
          },
        )

        const resvg = new Resvg(svg)
        const pngData = resvg.render()
        const pngBuffer = pngData.asPng()

        return new Response(new Uint8Array(pngBuffer), {
          headers: { 'Content-Type': 'image/png' },
        })
      },
    },
  },
})
