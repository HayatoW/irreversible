import { get, route } from "remix/routes";

export const routes = route({
  assets: get("/assets/*path"),
  home: "/",
  blog: {
    index: get("/blog"),
    show: get("/blog/:slug"),
  },
});
