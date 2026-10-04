import { css } from "remix/component";

import { routes } from "../routes.ts";
import { containerCss, labelCss, panelCss } from "./styles.ts";

const mainCss = css({
  paddingBlock: "4rem",
});

const panelInnerCss = css({
  padding: "3rem 2.5rem",
  textAlign: "center",
});

const errorLabelCss = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.6rem",
  "&::before": {
    content: '""',
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "var(--color-accent)",
    boxShadow: "0 0 0 4px rgba(255, 90, 31, 0.18)",
  },
});

const titleCss = css({
  margin: "1.2rem 0 0.6rem",
  fontFamily: "var(--font-display)",
  fontSize: "2rem",
  fontWeight: 700,
  letterSpacing: "-0.02em",
});

const backCss = css({
  display: "inline-flex",
  alignItems: "center",
  minHeight: "44px",
  marginTop: "1.6rem",
  paddingInline: "1.3rem",
  borderRadius: "var(--radius-pill)",
  border: "1px solid var(--color-line)",
  background: "var(--color-panel)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.8), 0 1px 2px rgba(29,28,26,.08)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.72rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  textDecoration: "none",
  "&:active": {
    boxShadow: "inset 0 2px 6px rgba(29,28,26,.18)",
  },
});

export function NotFoundPage() {
  return () => (
    <main mix={[containerCss, mainCss]}>
      <div mix={[panelCss, panelInnerCss]}>
        <span mix={[labelCss, errorLabelCss]}>Error 404</span>
        <h1 mix={titleCss}>404 - Page Not Found</h1>
        <p style={{ margin: 0, color: "var(--color-muted)" }}>
          The page you are looking for does not exist.
        </p>
        <a href={routes.home.href()} mix={backCss}>
          &larr; Index
        </a>
      </div>
    </main>
  );
}
