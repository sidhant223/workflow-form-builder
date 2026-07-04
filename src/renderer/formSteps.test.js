import { describe, it, expect } from "vitest";
import { groupFieldsBySection } from "./formSteps";

const fields = [
  { id: "f1", sectionId: "s1" },
  { id: "f2", sectionId: "s2" },
  { id: "f3", sectionId: "s1" },
  { id: "f4", sectionId: null },
];

const sections = [
  { id: "s1", name: "Personal Information" },
  { id: "s2", name: "Employment Information" },
];

describe("groupFieldsBySection", () => {
  it("returns a single unnamed group when there are no sections", () => {
    const groups = groupFieldsBySection(fields, []);
    expect(groups).toEqual([{ id: null, name: null, fields }]);
  });

  it("buckets fields into their assigned section, preserving section order", () => {
    const groups = groupFieldsBySection(fields, sections);
    expect(groups).toEqual([
      { id: "s1", name: "Personal Information", fields: [fields[0], fields[2], fields[3]] },
      { id: "s2", name: "Employment Information", fields: [fields[1]] },
    ]);
  });

  it("falls back a field with an unknown sectionId into the first section", () => {
    const withUnknown = [{ id: "f5", sectionId: "does-not-exist" }];
    const groups = groupFieldsBySection(withUnknown, sections);
    expect(groups[0].fields).toEqual(withUnknown);
  });
});
