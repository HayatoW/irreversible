import { describe, expect, it } from "vite-plus/test";
import { limitText, splitText } from "./text";

describe("Japanese specimen input", () => {
  it("keeps decomposed dakuten inside the eighth grapheme without changing the input", () => {
    expect(splitText("か\u3099")).toEqual(["か\u3099"]);
    expect(limitText("あいうえおかきか\u3099く")).toBe("あいうえおかきか\u3099");
  });

  it("keeps emoji sequences and unsupported combining clusters intact for DOM fallback", () => {
    expect(splitText("👩‍👩‍👧‍👧か\u3099")).toEqual(["👩‍👩‍👧‍👧", "か\u3099"]);
    expect(limitText("あいうえおかき👩‍👩‍👧‍👧く")).toBe("あいうえおかき👩‍👩‍👧‍👧");
    expect(splitText("漢\u3099")).toEqual(["漢\u3099"]);
  });

  it("preserves compatibility ideographs and variation selectors for DOM fallback", () => {
    expect(limitText("漢字")).toBe("漢字");
    expect(splitText("葛\u{E0100}")).toEqual(["葛\u{E0100}"]);
  });
});
