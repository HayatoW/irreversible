import fs from 'node:fs'
import path from 'node:path'
import { compile } from '@mdx-js/mdx'
import { sortBlogPosts, type BlogMetadata, type BlogPost, type BlogPostSummary, type CompiledBlogPost } from './utils'

function parseFrontmatter(fileContent: string) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  const match = frontmatterRegex.exec(fileContent)

  if (!match) {
    throw new Error('Missing frontmatter in blog post.')
  }

  const frontMatterBlock = match[1]
  const content = fileContent.replace(frontmatterRegex, '').trim()
  const frontMatterLines = frontMatterBlock.trim().split('\n')
  const metadata: Partial<BlogMetadata> = {}

  for (const line of frontMatterLines) {
    const [key, ...valueArr] = line.split(': ')
    const value = valueArr.join(': ').trim().replace(/^['"](.*)['"]$/, '$1')
    metadata[key.trim() as keyof BlogMetadata] = value
  }

  return { metadata: metadata as BlogMetadata, content }
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx')
}

function readMDXFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter(rawContent)
}

function readAllBlogPosts(): BlogPost[] {
  const postsDirectory = path.join(process.cwd(), 'app', 'blog', 'posts')

  return getMDXFiles(postsDirectory).map((file) => {
    const { metadata, content } = readMDXFile(path.join(postsDirectory, file))
    const slug = path.basename(file, path.extname(file))

    return {
      slug,
      metadata,
      content,
    }
  })
}

function toSummary(post: BlogPost): BlogPostSummary {
  return {
    slug: post.slug,
    metadata: post.metadata,
  }
}

export async function listBlogPosts() {
  return sortBlogPosts(readAllBlogPosts().map(toSummary))
}

export async function getCompiledBlogPost(slug: string): Promise<CompiledBlogPost | null> {
  const post = readAllBlogPosts().find((entry) => entry.slug === slug)

  if (!post) {
    return null
  }

  const code = String(
    await compile(post.content, {
      outputFormat: 'function-body',
    }),
  )

  return {
    slug: post.slug,
    metadata: post.metadata,
    code,
  }
}
