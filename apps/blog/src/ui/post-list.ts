import { createRovingFocus, definePrimitive } from "@ui-sdk/core";

export const postList = definePrimitive({
  name: "post-list",
  state: () => ({ focused: null as string | null }),
  api: (context) => {
    const roving = createRovingFocus(context, { slot: "link", key: "focused" });
    return { roving, focus: (value?: string) => roving.focus(value) };
  },
  slots: (slot) => ({
    root: slot({}),
    link: slot<{ value: string }>({
      props: { value: "string" },
      attrs: (state, part) => ({ tabindex: part.api.roving.tabIndex(state, part) }),
      on: {
        keydown: (event, { el, api }) => {
          if (el) api.roving.keydown(event, el);
        },
      },
      bind: (el, part) => part.api.roving.bind(el, part),
    }),
  }),
  agent: { actions: ["focus"] },
});
