// src/services/workflowService.js
// REST client for the "workflows" collection (workflow definitions).

import api from "./api";

export async function getWorkflows() {
  const { data } = await api.get("/workflows");
  return data;
}

export async function createWorkflow(payload) {
  const { data } = await api.post("/workflows", payload);
  return data;
}

export async function updateWorkflow(id, payload) {
  const { data } = await api.put(`/workflows/${id}`, payload);
  return data;
}

export async function deleteWorkflow(id) {
  await api.delete(`/workflows/${id}`);
  return id;
}
