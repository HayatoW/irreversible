import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { BlogPosts } from 'app/components/posts'
import { getBlogPosts } from 'app/blog/utils'

const fetchPosts = createServerFn().handler(() => {
  return getBlogPosts().map(({ content, ...rest }) => rest)
})

export const Route = createFileRoute('/')({
  loader: async () => {
    return { posts: await fetchPosts() }
  },
  component: Page,
})

function Page() {
  const { posts } = Route.useLoaderData()
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
      ></iframe>
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
