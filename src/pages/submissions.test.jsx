import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Submissions from "./submissions";
import { useSubmissionStore } from "../store/submissionStore";

beforeEach(() => {
  useSubmissionStore.setState({ submissions: [], nextRefNumber: 1 });
  localStorage.clear();
});

function seedSubmissions() {
  useSubmissionStore.getState().addSubmission({
    formId: "employee_registration",
    formName: "Employee Registration",
    responses: { field_1: "Jane Doe", field_2: "jane@test.com" },
    fields: [
      { id: "field_1", type: "text" },
      { id: "field_2", type: "email" },
    ],
  });
  useSubmissionStore.getState().addSubmission({
    formId: "customer_feedback",
    formName: "Customer Feedback",
    responses: { field_1: "Alice Smith", field_2: "5" },
    fields: [
      { id: "field_1", type: "text" },
      { id: "field_2", type: "text" },
    ],
  });
}

describe("Submissions page", () => {
  it("shows an empty state when there are no submissions", () => {
    render(<Submissions />);
    expect(screen.getByText("No submissions yet")).toBeInTheDocument();
  });

  it("lists every submission with its respondent name and form name", () => {
    seedSubmissions();
    render(<Submissions />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
  });

  it("filters the list by search term", async () => {
    seedSubmissions();
    const user = userEvent.setup();
    render(<Submissions />);

    await user.type(screen.getByPlaceholderText(/Search by name or form/i), "jane");

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
  });

  it("opens a detail modal showing the full response", async () => {
    seedSubmissions();
    const user = userEvent.setup();
    render(<Submissions />);

    const janeRow = screen.getByText("Jane Doe").closest("div").parentElement;
    await user.click(within(janeRow).getByRole("button", { name: "View Details" }));

    expect(screen.getByText("Submission Details")).toBeInTheDocument();
    expect(screen.getByText("jane@test.com")).toBeInTheDocument();
    expect(screen.getByText(/FORM-\d{6}/)).toBeInTheDocument();
  });
});
