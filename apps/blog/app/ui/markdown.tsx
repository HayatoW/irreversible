import type { Handle } from "remix/component";
import { css, unsafeHTML } from "remix/component";

const proseCss = css({
  fontSize: "1.05rem",
  lineHeight: 1.95,
  maxWidth: "38em",

  "& h2": {
    position: "relative",
    marginBlock: "2.6em 0.8em",
    paddingLeft: "1.1em",
    fontFamily: "var(--font-display)",
    fontSize: "1.5rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: 1.4,
  },
  "& h2::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: "0.42em",
    width: "0.55em",
    height: "0.55em",
    borderRadius: "50%",
    background: "var(--color-accent)",
  },
  "& h3": {
    marginBlock: "2em 0.6em",
    fontFamily: "var(--font-display)",
    fontSize: "1.2rem",
    fontWeight: 700,
  },
  "& p": {
    marginBlock: "1.4em",
  },
  "& a": {
    color: "var(--color-ink)",
    textDecorationColor: "var(--color-accent)",
    textDecorationThickness: "1.5px",
    textUnderlineOffset: "3px",
  },
  "& a:hover": {
    color: "var(--color-accent)",
  },
  "& ul, & ol": {
    paddingLeft: "1.4em",
    marginBlock: "1.4em",
  },
  "& li": {
    marginBlock: "0.4em",
  },
  "& blockquote": {
    marginBlock: "1.8em",
    marginInline: 0,
    padding: "0.2em 0 0.2em 1.2em",
    borderLeft: "4px solid var(--color-accent)",
    color: "var(--color-muted)",
  },
  "& iframe": {
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: "20px",
    border: 0,
    marginBlock: "2em",
    display: "block",
    boxShadow: "var(--shadow-panel)",
  },
  "& code": {
    fontFamily: "var(--font-mono)",
    fontSize: "0.85em",
    padding: "0.15em 0.45em",
    borderRadius: "7px",
    border: "1px solid var(--color-line)",
    background: "var(--color-panel)",
  },
  "& pre": {
    padding: "1.2em 1.4em",
    borderRadius: "20px",
    background: "var(--color-code-bg)",
    color: "var(--color-code-ink)",
    overflowX: "auto",
    marginBlock: "1.8em",
  },
  "& pre code": {
    padding: 0,
    border: 0,
    background: "transparent",
    color: "inherit",
    fontSize: "0.85rem",
  },
  "& img": {
    maxWidth: "100%",
    height: "auto",
    borderRadius: "20px",
    display: "block",
    marginBlock: "2em",
  },
  "& hr": {
    border: 0,
    height: "12px",
    marginBlock: "3em",
    backgroundImage: "radial-gradient(circle, var(--color-line) 1.6px, transparent 1.7px)",
    backgroundSize: "12px 12px",
    backgroundPosition: "center",
  },
});

export interface MarkdownProps {
  html: string;
}

export function Markdown(handle: Handle<MarkdownProps>) {
  return () => <div mix={proseCss} innerHTML={unsafeHTML(handle.props.html)} />;
}
