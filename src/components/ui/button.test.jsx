import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "./button";

describe("Button", () => {
  it("renders children and responds to clicks by default", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeEnabled();
  });

  it("disables the button when disabled is true", () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("disables the button and shows a spinner when isLoading is true", () => {
    render(<Button isLoading>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
