'use server'
import { createServerFn } from '@tanstack/react-start'
import { compile } from '@mdx-js/mdx'
import { getBlogPosts } from './utils'

export const fetchBlogPosts = createServerFn().handler(async () => {
  return getBlogPosts()
})

export const fetchBlogPost = createServerFn()
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const posts = getBlogPosts()
    const post = posts.find((p) => p.slug === slug)
    if (!post) return null
    const code = String(
      await compile(post.content, { outputFormat: 'function-body' }),
    )
    return {
      slug,
      title: post.metadata.title,
      publishedAt: post.metadata.publishedAt,
      summary: post.metadata.summary,
      image: post.metadata.image as string | undefined,
      code,
    }
  })
