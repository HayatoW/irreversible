import { defineHead } from "void";

export const head = defineHead(() => ({
  link: [
    {
      as: "font",
      crossorigin: "",
      href: "/fonts/tomorrow/tomorrow-900-italic-latin.woff2",
      rel: "preload",
      type: "font/woff2",
    },
  ],
}));
