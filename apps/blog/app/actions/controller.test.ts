import * as assert from "remix/assert";
import { describe, it } from "remix/test";

import { router } from "../router.tsx";
import { routes } from "../routes.ts";

describe("root controller", () => {
  it("GET / returns the blog index", async () => {
    let response = await router.fetch(new URL(routes.home.href(), "http://localhost"));

    assert.equal(response.status, 200);
    assert.match(response.headers.get("Content-Type") ?? "", /text\/html/);

    let html = await response.text();
    assert.match(html, /href="\/blog\/neon"/);
    assert.match(html, /Last Train Home/);
    assert.match(html, /<title>Irreversible<\/title>/);
    assert.match(html, /data-rmx-style/);
  });

  it("GET /blog redirects to /", async () => {
    let response = await router.fetch(new URL(routes.blog.index.href(), "http://localhost"));

    assert.equal(response.status, 301);
    assert.equal(response.headers.get("Location"), routes.home.href());
  });

  it("GET /blog/:slug returns the post page", async () => {
    let response = await router.fetch(
      new URL(routes.blog.show.href({ slug: "neon" }), "http://localhost"),
    );

    assert.equal(response.status, 200);

    let html = await response.text();
    assert.match(html, /<iframe/);
    assert.match(html, /<title>Neon \| Irreversible<\/title>/);
  });

  it("GET /blog/:slug returns 404 for an unknown slug", async () => {
    let response = await router.fetch(
      new URL(routes.blog.show.href({ slug: "does-not-exist" }), "http://localhost"),
    );

    assert.equal(response.status, 404);

    let html = await response.text();
    assert.match(html, /404 - Page Not Found/);
    assert.match(html, /<title>Not Found \| Irreversible<\/title>/);
  });

  it("GET /nope returns 404 for an unmatched route", async () => {
    let response = await router.fetch("http://localhost/nope");

    assert.equal(response.status, 404);

    let html = await response.text();
    assert.match(html, /404 - Page Not Found/);
    assert.match(html, /<title>Not Found \| Irreversible<\/title>/);
  });
});
