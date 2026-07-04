import { describe, it, expect } from "vitest";
import { paginate } from "./pagination";

describe("paginate", () => {
  const items = Array.from({ length: 23 }, (_, i) => i + 1);

  it("slices the requested page", () => {
    const result = paginate(items, 1, 10);
    expect(result.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.totalPages).toBe(3);
    expect(result.totalItems).toBe(23);
  });

  it("slices the last (partial) page", () => {
    const result = paginate(items, 3, 10);
    expect(result.items).toEqual([21, 22, 23]);
  });

  it("clamps a page number below 1 up to 1", () => {
    const result = paginate(items, 0, 10);
    expect(result.page).toBe(1);
    expect(result.items).toEqual(items.slice(0, 10));
  });

  it("clamps a page number beyond the last page down to the last page", () => {
    const result = paginate(items, 99, 10);
    expect(result.page).toBe(3);
    expect(result.items).toEqual([21, 22, 23]);
  });

  it("returns a single page of 1 when there are no items", () => {
    const result = paginate([], 1, 10);
    expect(result.totalPages).toBe(1);
    expect(result.items).toEqual([]);
  });
});
