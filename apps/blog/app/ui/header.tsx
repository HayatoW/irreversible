import { css } from "remix/component";

import { routes } from "../routes.ts";
import { containerCss, labelCss } from "./styles.ts";

const headerCss = css({
  borderBottom: "1px solid var(--color-line)",
  background: "color-mix(in oklab, var(--color-bg) 82%, white 18%)",
});

const dotStripCss = css({
  height: "10px",
  backgroundImage: "radial-gradient(circle, var(--color-line) 1.4px, transparent 1.5px)",
  backgroundSize: "10px 10px",
  backgroundPosition: "center",
  borderBottom: "1px solid var(--color-line)",
});

const innerCss = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  paddingBlock: "1.1rem",
});

const brandCss = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.7rem",
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "1.15rem",
  letterSpacing: "-0.01em",
  color: "var(--color-ink)",
  textDecoration: "none",
  minHeight: "44px",
});

const dialCss = css({
  position: "relative",
  width: "26px",
  height: "26px",
  borderRadius: "50%",
  border: "2px solid var(--color-ink)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.8), 0 1px 2px rgba(29,28,26,.2)",
  background: "var(--color-panel)",
  "&::after": {
    content: '""',
    position: "absolute",
    top: "3px",
    left: "50%",
    width: "5px",
    height: "5px",
    marginLeft: "-2.5px",
    borderRadius: "50%",
    background: "var(--color-accent)",
  },
});

const metaCss = css({
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  "&::before": {
    content: '""',
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "var(--color-accent)",
    boxShadow: "0 0 0 3px rgba(255, 90, 31, 0.18)",
  },
});

export function Header() {
  return () => (
    <header mix={headerCss}>
      <div mix={[containerCss, innerCss]}>
        <a href={routes.home.href()} mix={brandCss}>
          <span mix={dialCss} aria-hidden="true" />
          Irreversible
        </a>
        <span mix={[labelCss, metaCss]}>JOURNAL — VOL.01</span>
      </div>
      <div mix={dotStripCss} aria-hidden="true" />
    </header>
  );
}
