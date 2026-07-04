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
import { getForms, getForm, createForm, updateForm, deleteForm } from "./formService";

describe("formService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getForms sends a GET to /forms and unwraps the data", async () => {
    api.get.mockResolvedValue({ data: [{ id: "1", formName: "Leave Request" }] });
    const forms = await getForms();
    expect(api.get).toHaveBeenCalledWith("/forms");
    expect(forms).toEqual([{ id: "1", formName: "Leave Request" }]);
  });

  it("getForm sends a GET to /forms/:id", async () => {
    api.get.mockResolvedValue({ data: { id: "1", formName: "Leave Request" } });
    const form = await getForm("1");
    expect(api.get).toHaveBeenCalledWith("/forms/1");
    expect(form).toEqual({ id: "1", formName: "Leave Request" });
  });

  it("createForm sends a POST to /forms with the payload", async () => {
    const payload = { formName: "New Form" };
    api.post.mockResolvedValue({ data: { id: "2", ...payload } });
    const form = await createForm(payload);
    expect(api.post).toHaveBeenCalledWith("/forms", payload);
    expect(form).toEqual({ id: "2", formName: "New Form" });
  });

  it("updateForm sends a PUT to /forms/:id with the payload", async () => {
    const payload = { formName: "Updated Form" };
    api.put.mockResolvedValue({ data: { id: "2", ...payload } });
    const form = await updateForm("2", payload);
    expect(api.put).toHaveBeenCalledWith("/forms/2", payload);
    expect(form).toEqual({ id: "2", formName: "Updated Form" });
  });

  it("deleteForm sends a DELETE to /forms/:id and resolves with the id", async () => {
    api.delete.mockResolvedValue({});
    const id = await deleteForm("3");
    expect(api.delete).toHaveBeenCalledWith("/forms/3");
    expect(id).toBe("3");
  });
});
