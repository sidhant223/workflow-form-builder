import { describe, it, expect } from "vitest";
import { templates } from "./templates";

describe("templates", () => {
  it("exposes exactly the three Week 5 templates in order", () => {
    expect(templates.map((t) => t.key)).toEqual([
      "employee_registration",
      "leave_request",
      "customer_feedback",
    ]);
  });

  it("gives every template a name, description, and at least one field", () => {
    templates.forEach((template) => {
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(Array.isArray(template.fields)).toBe(true);
      expect(template.fields.length).toBeGreaterThan(0);
    });
  });

  it("splits the leave request template across two sections, all fields assigned", () => {
    const leaveRequest = templates.find((t) => t.key === "leave_request");
    expect(leaveRequest.sections).toHaveLength(2);
    const sectionIds = new Set(leaveRequest.sections.map((s) => s.id));
    leaveRequest.fields.forEach((field) => {
      expect(sectionIds.has(field.sectionId)).toBe(true);
    });
  });

  it("gives every field a unique id within its own template", () => {
    templates.forEach((template) => {
      const ids = template.fields.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
