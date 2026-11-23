import { describe, expect, it } from "vite-plus/test";
import { limitText, splitText } from "./text";

describe("Japanese specimen input", () => {
  it("normalizes decomposed dakuten before applying the eight-character limit", () => {
    expect(splitText("か\u3099")).toEqual(["が"]);
    expect(limitText("あいうえおかきか\u3099く")).toBe("あいうえおかきが");
  });

  it("keeps emoji sequences and unsupported combining clusters intact for DOM fallback", () => {
    expect(splitText("👩‍👩‍👧‍👧か\u3099")).toEqual(["👩‍👩‍👧‍👧", "が"]);
    expect(limitText("あいうえおかき👩‍👩‍👧‍👧く")).toBe("あいうえおかき👩‍👩‍👧‍👧");
    expect(splitText("漢\u3099")).toEqual(["漢\u3099"]);
  });
});
