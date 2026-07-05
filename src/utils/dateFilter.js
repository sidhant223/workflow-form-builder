// src/utils/dateFilter.js
// Shared "is this timestamp within the last N days" logic used by every
// list page's date-range filter (Forms, Submissions).

const DAY_MS = 24 * 60 * 60 * 1000;
export const DATE_FILTER_DAYS = { today: 1, "7days": 7, "30days": 30 };

// Shared <select> options for every list page's "Filter by date" control.
export const DATE_FILTER_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
];

export function isWithinDateFilter(isoString, filter, now = Date.now()) {
  if (filter === "all") return true;
  const days = DATE_FILTER_DAYS[filter];
  if (!days) return true;
  return new Date(isoString).getTime() >= now - days * DAY_MS;
}
