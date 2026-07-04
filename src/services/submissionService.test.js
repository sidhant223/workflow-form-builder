import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "./api";
import {
  getSubmissions,
  getSubmission,
  createSubmission,
  updateSubmission,
} from "./submissionService";

describe("submissionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getSubmissions sends a GET to /submissions and unwraps the data", async () => {
    api.get.mockResolvedValue({ data: [{ id: "s1", formName: "Leave Request" }] });
    const submissions = await getSubmissions();
    expect(api.get).toHaveBeenCalledWith("/submissions");
    expect(submissions).toEqual([{ id: "s1", formName: "Leave Request" }]);
  });

  it("getSubmission sends a GET to /submissions/:id", async () => {
    api.get.mockResolvedValue({ data: { id: "s1", formName: "Leave Request" } });
    const submission = await getSubmission("s1");
    expect(api.get).toHaveBeenCalledWith("/submissions/s1");
    expect(submission).toEqual({ id: "s1", formName: "Leave Request" });
  });

  it("createSubmission sends a POST to /submissions with the payload", async () => {
    const payload = { formName: "Leave Request", responses: {} };
    api.post.mockResolvedValue({ data: { id: "s2", ...payload } });
    const submission = await createSubmission(payload);
    expect(api.post).toHaveBeenCalledWith("/submissions", payload);
    expect(submission).toEqual({ id: "s2", ...payload });
  });

  it("updateSubmission sends a PUT to /submissions/:id with the payload", async () => {
    const payload = { stage: "Approved" };
    api.put.mockResolvedValue({ data: { id: "s2", ...payload } });
    const submission = await updateSubmission("s2", payload);
    expect(api.put).toHaveBeenCalledWith("/submissions/s2", payload);
    expect(submission).toEqual({ id: "s2", ...payload });
  });
});
