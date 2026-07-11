import { describe, it, expect, vi } from "vitest";

vi.mock("../store/authStore", () => ({
  useAuthStore: { getState: () => ({ token: "mock-token-123" }) },
}));

import api from "./api";

describe("api", () => {
  it("configures the base URL, default headers, and a timeout", () => {
    expect(api.defaults.baseURL).toBe("http://localhost:4000");
    expect(api.defaults.headers["Content-Type"]).toBe("application/json");
    expect(api.defaults.timeout).toBe(10000);
  });

  it("attaches a bearer token from the auth store to every request", () => {
    const attachToken = api.interceptors.request.handlers[0].fulfilled;
    const config = attachToken({ headers: {} });
    expect(config.headers.Authorization).toBe("Bearer mock-token-123");
  });

  it("normalizes a server error response into { message, status }", async () => {
    const handleRejection = api.interceptors.response.handlers[0].rejected;
    await expect(
      handleRejection({ response: { status: 404, data: { message: "Not found" } } })
    ).rejects.toEqual({ message: "Not found", status: 404 });
  });

  it("falls back to the axios error message when the server sends none", async () => {
    const handleRejection = api.interceptors.response.handlers[0].rejected;
    await expect(handleRejection({ message: "Network Error" })).rejects.toEqual({
      message: "Network Error",
      status: null,
    });
  });

  it("falls back to a generic message when neither is available", async () => {
    const handleRejection = api.interceptors.response.handlers[0].rejected;
    await expect(handleRejection({})).rejects.toEqual({
      message: "Something went wrong. Please try again.",
      status: null,
    });
  });
});
