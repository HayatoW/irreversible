import { Link } from '@tanstack/react-router'
import { runSync } from '@mdx-js/mdx'
import * as jsxRuntime from 'react/jsx-runtime'
import { highlight } from 'sugar-high'
import React from 'react'

// @types/react 18.x doesn't expose jsx/jsxs/Fragment on react/jsx-runtime, but they exist at runtime
const { jsx, jsxs, Fragment } = jsxRuntime as typeof jsxRuntime & {
  jsx: unknown
  jsxs: unknown
  Fragment: unknown
}

function Table({ data }: { data: { headers: string[]; rows: string[][] } }) {
  const headers = data.headers.map((header, i) => (
    <th key={i}>{header}</th>
  ))
  const rows = data.rows.map((row, i) => (
    <tr key={i}>
      {row.map((cell, j) => (
        <td key={j}>{cell}</td>
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

function CustomLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }) {
  const href = props.href
  if (href?.startsWith('/')) {
    return (
      <Link to={href} {...(props as any)}>
        {props.children}
      </Link>
    )
  }
  if (href?.startsWith('#')) {
    return <a {...props} />
  }
  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={props.alt || ''} className="rounded-lg" {...props} />
}

function Code({ children, ...props }: { children: string } & React.HTMLAttributes<HTMLElement>) {
  const codeHTML = highlight(children)
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

function createHeading(level: number) {
  const Heading = ({ children }: { children: React.ReactNode }) => {
    const slug = slugify(String(children))
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
      children,
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

export function CustomMDX({ code, components: extraComponents }: { code: string; components?: Record<string, React.ComponentType<any>> }) {
  const { default: Content } = runSync(code, { jsx, jsxs, Fragment, baseUrl: import.meta.url } as Parameters<typeof runSync>[1])
  return <Content components={{ ...components, ...(extraComponents || {}) }} />
}
