import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DynamicField from "./DynamicField";

const textField = {
  id: "field_1",
  type: "text",
  label: "Full Name",
  placeholder: "Enter name",
  required: true,
};

describe("DynamicField", () => {
  it("renders the field's error message", () => {
    render(
      <DynamicField field={textField} value="" onChange={() => {}} error="Full Name is required" />
    );
    expect(screen.getByText("Full Name is required")).toBeInTheDocument();
  });

  it("calls onChange with the raw new value, no field-id wrapping", () => {
    const handleChange = vi.fn();
    render(<DynamicField field={textField} value="" onChange={handleChange} />);
    fireEvent.change(screen.getByPlaceholderText("Enter name"), { target: { value: "Jane" } });
    expect(handleChange).toHaveBeenCalledWith("Jane");
  });

  it("renders checkbox fields with error text and a boolean onChange", () => {
    const handleChange = vi.fn();
    render(
      <DynamicField
        field={{ id: "f2", type: "checkbox", label: "Agree", required: true }}
        value={false}
        onChange={handleChange}
        error="Agree is required"
      />
    );
    expect(screen.getByText("Agree is required")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("renders an error beneath a radio group", () => {
    render(
      <DynamicField
        field={{ id: "f3", type: "radio", label: "Pick one", options: ["A", "B"] }}
        value=""
        onChange={() => {}}
        error="Pick one is required"
      />
    );
    expect(screen.getByText("Pick one is required")).toBeInTheDocument();
  });

  it("shows an unsupported-type message for unknown types", () => {
    render(<DynamicField field={{ id: "x", type: "bogus" }} value="" onChange={() => {}} />);
    expect(screen.getByText(/Unsupported field type/)).toBeInTheDocument();
  });
});
