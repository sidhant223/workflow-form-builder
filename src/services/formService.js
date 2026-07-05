// src/services/formService.js
// REST client for the "forms" collection (saved form definitions).

import api from "./api";

export async function getForms() {
  const { data } = await api.get("/forms");
  return data;
}

export async function createForm(payload) {
  const { data } = await api.post("/forms", payload);
  return data;
}

export async function updateForm(id, payload) {
  const { data } = await api.put(`/forms/${id}`, payload);
  return data;
}

export async function deleteForm(id) {
  await api.delete(`/forms/${id}`);
  return id;
}
