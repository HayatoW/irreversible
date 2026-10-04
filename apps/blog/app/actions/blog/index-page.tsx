import { css } from "remix/component";

import { blogs } from "../../lib/blogs.ts";
import { routes } from "../../routes.ts";
import { containerCss, labelCss, panelCss } from "../../ui/styles.ts";

const mainCss = css({
  paddingBlock: "3.5rem",
});

const leadCss = css({
  marginBottom: "3rem",
});

const leadTextCss = css({
  margin: "1rem 0 0",
  maxWidth: "36em",
  fontSize: "1.1rem",
  lineHeight: 1.9,
  color: "var(--color-muted)",
});

const listCss = css({
  display: "grid",
  gap: "1.1rem",
  margin: 0,
  padding: 0,
  listStyle: "none",
});

const cardCss = css({
  display: "grid",
  gridTemplateColumns: "3.5rem 1fr auto",
  alignItems: "center",
  gap: "1.4rem",
  padding: "1.5rem 1.7rem",
  transition: "transform 200ms ease, box-shadow 200ms ease",
  animation: "rise 700ms cubic-bezier(0.16, 1, 0.3, 1) backwards",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,.8), 0 2px 3px rgba(29,28,26,.06), 0 26px 48px -20px rgba(29,28,26,.3)",
  },
  "&:active": {
    transform: "translateY(0)",
    boxShadow: "inset 0 2px 8px rgba(29,28,26,.12), var(--shadow-panel)",
  },
  "&:hover > :last-child": {
    background: "var(--color-accent)",
    borderColor: "var(--color-accent)",
    color: "#fff",
  },
  "@media (max-width: 40rem)": {
    gridTemplateColumns: "1fr auto",
    gridTemplateAreas: '"body knob"',
    gap: "0.9rem 1rem",
    padding: "1.2rem 1.3rem",
  },
});

const entryNoCss = css({
  fontFamily: "var(--font-mono)",
  fontSize: "1.5rem",
  fontWeight: 500,
  color: "var(--color-muted)",
  "@media (max-width: 40rem)": {
    display: "none",
  },
});

const bodyCss = css({
  minWidth: 0,
  "@media (max-width: 40rem)": {
    gridArea: "body",
  },
});

const titleLinkCss = css({
  color: "var(--color-ink)",
  textDecoration: "none",
});

const titleCss = css({
  margin: "0.35rem 0 0.4rem",
  fontFamily: "var(--font-display)",
  fontSize: "1.45rem",
  fontWeight: 700,
  letterSpacing: "-0.01em",
  lineHeight: 1.3,
});

const summaryCss = css({
  margin: 0,
  fontSize: "0.92rem",
  lineHeight: 1.7,
  color: "var(--color-muted)",
});

const knobCss = css({
  display: "grid",
  placeItems: "center",
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  border: "2px solid var(--color-ink)",
  background: "var(--color-panel)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.8), 0 2px 4px rgba(29,28,26,.15)",
  color: "var(--color-ink)",
  fontFamily: "var(--font-mono)",
  fontSize: "1rem",
  transition: "background-color 200ms ease, color 200ms ease, border-color 200ms ease",
  "@media (max-width: 40rem)": {
    gridArea: "knob",
    alignSelf: "start",
  },
});

export function BlogIndexPage() {
  return () => (
    <main mix={[containerCss, mainCss]}>
      <section mix={leadCss}>
        <p mix={labelCss} style={{ margin: 0 }}>
          Index
        </p>
        <p mix={leadTextCss}>
          Hello Friend. I build software and share my place with two cats. When I'm not coding, I'm
          usually listening to These New Puritans or Nils Frahm, or thinking about design—especially
          ACRNM's take on function and form.
        </p>
      </section>

      <ul mix={listCss}>
        {blogs.map((post, index) => (
          <li key={post.slug}>
            <article mix={[panelCss, cardCss]} style={{ animationDelay: `${index * 90 + 60}ms` }}>
              <span mix={entryNoCss}>{String(index + 1).padStart(2, "0")}</span>
              <div mix={bodyCss}>
                <p mix={labelCss} style={{ margin: 0 }}>
                  Published {post.publishedAt}
                </p>
                <h2 mix={titleCss}>
                  <a href={routes.blog.show.href({ slug: post.slug })} mix={titleLinkCss}>
                    {post.title}
                  </a>
                </h2>
                <p mix={summaryCss}>{post.summary}</p>
              </div>
              <span mix={knobCss} aria-hidden="true">
                &rarr;
              </span>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
