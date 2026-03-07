import { runSync } from '@mdx-js/mdx'
import { Link } from '@tanstack/react-router'
import { highlight } from 'sugar-high'
import React from 'react'
import * as runtime from 'react/jsx-runtime'

type TableProps = {
  data: {
    headers: string[]
    rows: string[][]
  }
}

type CustomLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>

type CustomMDXProps = {
  code: string
  components?: Record<string, React.ComponentType<any>>
}

function Table({ data }: TableProps) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function CustomLink({ href = '', ...props }: CustomLinkProps) {
  if (href.startsWith('/')) {
    return <Link to={href} {...props} />
  }

  if (href.startsWith('#')) {
    return <a href={href} {...props} />
  }

  return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage({
  alt,
  className = '',
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={alt} className={`rounded-lg ${className}`.trim()} {...props} />
}

function Code({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children: React.ReactNode }) {
  const codeHTML = highlight(typeof children === 'string' ? children : String(children))
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

function flattenText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(flattenText).join('')
  }

  if (React.isValidElement(node)) {
    return flattenText(node.props.children)
  }

  return ''
}

function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

function createHeading(level) {
  const Heading = ({ children }: { children: React.ReactNode }) => {
    const slug = slugify(flattenText(children))
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  Table,
}

export function CustomMDX({ code, components: overrides }: CustomMDXProps) {
  const { default: Content } = runSync(code, {
    ...runtime,
    baseUrl: import.meta.url,
  } as any)

  return <Content components={{ ...components, ...(overrides || {}) }} />
}
