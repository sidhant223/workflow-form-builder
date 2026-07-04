import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Header from "./header";
import { useRoleStore, MOCK_USERS } from "../store/roleStore";

beforeEach(() => {
  useRoleStore.setState({ currentUserId: MOCK_USERS[0].id });
  localStorage.clear();
});

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header openSidebar={() => {}} />
    </MemoryRouter>
  );
}

describe("Header role switcher", () => {
  it("defaults to the Admin mock user", () => {
    renderHeader();
    expect(screen.getByLabelText("Simulated active user").value).toBe("user_admin");
  });

  it("switches the simulated active user, updating the profile label", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.selectOptions(screen.getByLabelText("Simulated active user"), "user_manager");

    expect(useRoleStore.getState().currentUserId).toBe("user_manager");
    expect(screen.getByText("Manager")).toBeInTheDocument();
  });
});
