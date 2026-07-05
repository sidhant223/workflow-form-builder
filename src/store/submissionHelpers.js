import { isWithinDateFilter } from "../utils/dateFilter";

const NAME_LIKE_TYPES = ["text", "email"];

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

function isPending(submission) {
  if (!submission.stage) return false;
  const stage = submission.stage.toLowerCase();
  return stage !== "approved" && stage !== "rejected";
}

export function filterSubmissions(
  submissions,
  {
    search = "",
    dateFilter = "all",
    statusFilter = "all",
    mode = "all",
    currentUserName = "",
    now = Date.now(),
  } = {}
) {
  const term = search.trim().toLowerCase();

  return submissions.filter((submission) => {
    const matchesSearch =
      !term ||
      submission.displayName.toLowerCase().includes(term) ||
      submission.formName.toLowerCase().includes(term) ||
      Object.values(submission.responses || {}).some(
        (value) => typeof value === "string" && value.toLowerCase().includes(term)
      );
    if (!matchesSearch) return false;

    if (!isWithinDateFilter(submission.submittedAt, dateFilter, now)) return false;

    if (statusFilter !== "all") {
      const stage = (submission.stage || "").toLowerCase();
      if (statusFilter === "approved" && stage !== "approved") return false;
      if (statusFilter === "rejected" && stage !== "rejected") return false;
      if (statusFilter === "pending" && !isPending(submission)) return false;
    }

    if (mode === "mine" && submission.submittedBy !== currentUserName) return false;
    if (mode === "pending" && !isPending(submission)) return false;

    return true;
  });
}
