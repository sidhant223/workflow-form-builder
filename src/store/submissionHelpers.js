const NAME_LIKE_TYPES = ["text", "email"];
const DAY_MS = 24 * 60 * 60 * 1000;
const FILTER_DAYS = { today: 1, "7days": 7, "30days": 30 };

export function formatReferenceNumber(n) {
  return `FORM-${String(n).padStart(6, "0")}`;
}

export function extractDisplayName(responses, fields) {
  const candidate = fields.find((f) => NAME_LIKE_TYPES.includes(f.type) && responses[f.id]);
  return candidate ? String(responses[candidate.id]) : "Anonymous";
}

export function initialStage(stages) {
  return stages && stages.length ? stages[0] : null;
}

export function buildHistoryEntry({ stage, action, user, comment = "", timestamp }) {
  return {
    stage,
    action,
    user: user || "Unknown",
    comment,
    timestamp: timestamp || new Date().toISOString(),
  };
}

export function filterSubmissions(
  submissions,
  { search = "", dateFilter = "all", now = Date.now() } = {}
) {
  const term = search.trim().toLowerCase();

  return submissions.filter((submission) => {
    const matchesSearch =
      !term ||
      submission.displayName.toLowerCase().includes(term) ||
      submission.formName.toLowerCase().includes(term);

    if (!matchesSearch) return false;
    if (dateFilter === "all") return true;

    const days = FILTER_DAYS[dateFilter];
    if (!days) return true;

    const submittedAt = new Date(submission.submittedAt).getTime();
    return submittedAt >= now - days * DAY_MS;
  });
}
