import { createServerFn } from '@tanstack/react-start'
import type { CompiledBlogPost } from './utils'

export const getBlogPosts = createServerFn({ method: 'GET' }).handler(async () => {
  const { listBlogPosts } = await import('./posts.server')
  return listBlogPosts()
})

export const getBlogPost = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<CompiledBlogPost | null> => {
    const { getCompiledBlogPost } = await import('./posts.server')
    return getCompiledBlogPost(data.slug)
  })
