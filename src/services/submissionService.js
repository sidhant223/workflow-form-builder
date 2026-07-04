// src/services/submissionService.js
// REST client for the "submissions" collection (form submission records).

import api from "./api";

export async function getSubmissions() {
  const { data } = await api.get("/submissions");
  return data;
}

export async function getSubmission(id) {
  const { data } = await api.get(`/submissions/${id}`);
  return data;
}

export async function createSubmission(payload) {
  const { data } = await api.post("/submissions", payload);
  return data;
}

export async function updateSubmission(id, payload) {
  const { data } = await api.put(`/submissions/${id}`, payload);
  return data;
}
