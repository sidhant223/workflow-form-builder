import { describe, it, expect } from "vitest";

describe("test toolchain", () => {
  it("runs a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("has jsdom's localStorage available", () => {
    localStorage.setItem("x", "1");
    expect(localStorage.getItem("x")).toBe("1");
    localStorage.clear();
  });
});
