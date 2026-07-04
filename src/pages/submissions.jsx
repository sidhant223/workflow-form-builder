// src/pages/submissions.jsx
// Route: /submissions (mode="all"), /pending-approvals (mode="pending"),
// /my-submissions (mode="mine")
// Real submission history: search by name/form/response value, filter by
// date and stage, paginate, and view full details including workflow
// status, timeline, task assignment, and actions.

import { useEffect, useMemo, useState } from "react";
import { useSubmissionStore } from "../store/submissionStore";
import { useCurrentUser } from "../store/authStore";
import { filterSubmissions } from "../store/submissionHelpers";
import { stageBadgeType } from "../workflow/stageBadge";
import { paginate } from "../utils/pagination";
import SubmissionDetailModal from "../components/submissions/SubmissionDetailModal";
import Badge from "../components/ui/badge";
import Toast from "../components/ui/toast";
import Spinner from "../components/ui/spinner";
import ErrorBanner from "../components/ui/errorBanner";
import EmptyState from "../components/ui/emptyState";
import Pagination from "../components/ui/pagination";

const DATE_FILTERS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All Statuses" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

const MODE_COPY = {
  all: {
    title: "Submissions",
    subtitle: "View submitted forms and their responses.",
    emptyTitle: "No submissions yet",
  },
  pending: {
    title: "Pending Approvals",
    subtitle: "Submissions waiting on your review.",
    emptyTitle: "Nothing pending review",
  },
  mine: {
    title: "My Submissions",
    subtitle: "Forms you've submitted.",
    emptyTitle: "You haven't submitted anything yet",
  },
};

const PAGE_SIZE = 5;

function Submissions({ mode = "all" }) {
  const submissions = useSubmissionStore((s) => s.submissions);
  const isLoading = useSubmissionStore((s) => s.isLoading);
  const error = useSubmissionStore((s) => s.error);
  const fetchSubmissions = useSubmissionStore((s) => s.fetchSubmissions);
  const currentUser = useCurrentUser();

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const updateDateFilter = (value) => {
    setDateFilter(value);
    setPage(1);
  };

  const updateStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const filtered = useMemo(
    () =>
      filterSubmissions(submissions, {
        search,
        dateFilter,
        statusFilter,
        mode,
        currentUserName: currentUser.name,
      }),
    [submissions, search, dateFilter, statusFilter, mode, currentUser.name]
  );

  const { items: visible, totalPages } = useMemo(
    () => paginate(filtered, page, PAGE_SIZE),
    [filtered, page]
  );

  // Keep the open modal's data fresh as the underlying submission changes
  // (e.g. after an approve/reject action updates its stage and history).
  const selectedSubmission = selected
    ? submissions.find((s) => s.id === selected.id) || null
    : null;

  const copy = MODE_COPY[mode] || MODE_COPY.all;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{copy.title}</h1>
      <p className="mt-2 text-gray-600">{copy.subtitle}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          placeholder="Search by name, form, or email…"
          className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        />
        <select
          value={dateFilter}
          onChange={(e) => updateDateFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        >
          {DATE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => updateStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <Spinner label="Loading submissions…" />
        ) : error ? (
          <div className="p-4">
            <ErrorBanner message={error} onRetry={fetchSubmissions} />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState icon="📭" title={copy.emptyTitle} />
        ) : (
          visible.map((submission) => (
            <div
              key={submission.id}
              className="flex items-center justify-between border-b border-gray-100 p-4 last:border-b-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800">{submission.displayName}</p>
                  {submission.stage && (
                    <Badge text={submission.stage} type={stageBadgeType(submission.stage)} />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {submission.formName} · {new Date(submission.submittedAt).toLocaleString()}
                  {submission.assignedTo && <> · Assigned to {submission.assignedTo}</>}
                </p>
              </div>
              <button
                onClick={() => setSelected(submission)}
                className="text-sm font-medium text-violet-600 hover:underline"
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {!isLoading && !error && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <SubmissionDetailModal
        submission={selectedSubmission}
        onClose={() => setSelected(null)}
        onNotify={setToastMessage}
      />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}

export default Submissions;
