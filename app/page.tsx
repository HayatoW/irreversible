import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Irreversible
      </h1>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/TfTODnT_dUw?si=KKFKiouh1ULbd8mf" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
      <p className="my-4">
        {`Hello Friend.`}<br/>
        {`Software Engineer. 愛猫家。`}<br/>
        {`These New Puritans, Nils Frahm, ACRNM`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
