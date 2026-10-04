import { css } from "remix/component";

export const containerCss = css({
  width: "min(var(--measure), 100% - 2.5rem)",
  marginInline: "auto",
});

export const panelCss = css({
  borderRadius: "var(--radius-panel)",
  border: "1px solid var(--color-line)",
  background: "var(--color-panel)",
  boxShadow: "var(--shadow-panel)",
});

export const labelCss = css({
  fontFamily: "var(--font-mono)",
  fontSize: "0.72rem",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--color-muted)",
});
