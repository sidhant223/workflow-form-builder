import { describe, it, expect } from "vitest";
import { createField } from "./formSchema";

describe("createField", () => {
  it("includes the new validation, conditional, and step properties", () => {
    const field = createField("text", "field_1");

    expect(field).toMatchObject({
      id: "field_1",
      type: "text",
      required: false,
      minLength: undefined,
      maxLength: undefined,
      min: undefined,
      max: undefined,
      pattern: "",
      patternMessage: "",
      showIf: null,
      sectionId: null,
    });
  });

  it("still attaches options for select/radio fields", () => {
    const field = createField("select", "field_2");
    expect(field.options).toEqual(["Option 1", "Option 2", "Option 3"]);
  });
});
