import { beforeEach, describe, expect, test, vi } from "vitest";

import { scale } from "./canvas";

describe("scale", () => {
  beforeEach(() => {
    vi.mock("./colors.ts");
  });

  test("scale should return the correct value", () => {
    expect(scale(50, 0, 100, 0, 20)).toBe(10);
  });
});
