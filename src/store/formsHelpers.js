// src/store/formsHelpers.js
// Pure search/filter/sort logic for the Forms list page.

import { isWithinDateFilter } from "../utils/dateFilter";

export function filterAndSortForms(
  forms,
  { search = "", statusFilter = "all", dateFilter = "all", sortBy = "date", now = Date.now() } = {}
) {
  const term = search.trim().toLowerCase();

  const filtered = forms.filter((form) => {
    const matchesSearch = !term || (form.formName || "").toLowerCase().includes(term);
    if (!matchesSearch) return false;

    if (statusFilter !== "all" && (form.status || "Draft") !== statusFilter) return false;

    if (!isWithinDateFilter(form.createdAt, dateFilter, now)) return false;

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sortBy === "name") {
      return (a.formName || "").localeCompare(b.formName || "");
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
