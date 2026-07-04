// src/store/formsHelpers.js
// Pure search/filter/sort logic for the Forms list page.

const DAY_MS = 24 * 60 * 60 * 1000;
const FILTER_DAYS = { today: 1, "7days": 7, "30days": 30 };

export function filterAndSortForms(
  forms,
  { search = "", statusFilter = "all", dateFilter = "all", sortBy = "date", now = Date.now() } = {}
) {
  const term = search.trim().toLowerCase();

  const filtered = forms.filter((form) => {
    const matchesSearch = !term || (form.formName || "").toLowerCase().includes(term);
    if (!matchesSearch) return false;

    if (statusFilter !== "all" && (form.status || "Draft") !== statusFilter) return false;

    if (dateFilter !== "all") {
      const days = FILTER_DAYS[dateFilter];
      if (days) {
        const createdAt = new Date(form.createdAt).getTime();
        if (createdAt < now - days * DAY_MS) return false;
      }
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sortBy === "name") {
      return (a.formName || "").localeCompare(b.formName || "");
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
