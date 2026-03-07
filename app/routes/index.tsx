import { createFileRoute } from '@tanstack/react-router'
import { fetchBlogPosts } from '../blog/server'
import { BlogPosts } from '../components/posts'

export const Route = createFileRoute('/')({
  loader: () => fetchBlogPosts(),
  component: HomePage,
})

function HomePage() {
  const posts = Route.useLoaderData()
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Irreversible
      </h1>
      <iframe
        className="w-full aspect-video"
        src="https://www.youtube.com/embed/TfTODnT_dUw?si=KKFKiouh1ULbd8mf"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
      <p className="my-4">
        {`Hello Friend.`}
        <br />
        {`Software Engineer. 愛猫家。`}
        <br />
        {`These New Puritans, Nils Frahm, ACRNM`}
      </p>
      <div className="my-8">
        <BlogPosts posts={posts} />
      </div>
    </section>
  )
}
