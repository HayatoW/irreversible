import { css } from "remix/component";

import { containerCss, labelCss } from "./styles.ts";

const footerCss = css({
  marginTop: "5rem",
});

const stripesCss = css({
  display: "flex",
  height: "8px",
  "& > span": { flex: 1 },
  "& > span:nth-of-type(1)": { background: "var(--color-accent)" },
  "& > span:nth-of-type(2)": { background: "var(--color-amber)" },
  "& > span:nth-of-type(3)": { background: "var(--color-brown)" },
});

const innerCss = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.8rem 1.5rem",
  paddingBlock: "1.6rem 2.6rem",
  borderTop: "1px solid var(--color-line)",
});

const linksCss = css({
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
});

const pillLinkCss = css({
  display: "inline-flex",
  alignItems: "center",
  minHeight: "44px",
  paddingInline: "1.15rem",
  borderRadius: "var(--radius-pill)",
  border: "1px solid var(--color-line)",
  background: "var(--color-panel)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.8), 0 1px 2px rgba(29,28,26,.08)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.72rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--color-ink)",
  textDecoration: "none",
  transition: "transform 160ms ease, box-shadow 160ms ease",
  "&:hover": {
    color: "var(--color-accent)",
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(0)",
    boxShadow: "inset 0 2px 6px rgba(29,28,26,.18), 0 1px 1px rgba(29,28,26,.06)",
  },
});

export function Footer() {
  let year = new Date().getFullYear();

  return () => (
    <footer mix={footerCss}>
      <div mix={stripesCss} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div mix={[containerCss, innerCss]}>
        <p mix={labelCss} style={{ margin: 0 }}>
          &copy; {year} HayatoW
        </p>
        <nav mix={linksCss}>
          <a
            href="https://x.com/nabecmdctrl"
            target="_blank"
            rel="noopener noreferrer"
            mix={pillLinkCss}
          >
            X
          </a>
          <a
            href="https://github.com/HayatoW"
            target="_blank"
            rel="noopener noreferrer"
            mix={pillLinkCss}
          >
            GitHub
          </a>
        </nav>
        <p mix={labelCss} style={{ margin: 0 }}>
          Built with Remix
        </p>
      </div>
    </footer>
  );
}
