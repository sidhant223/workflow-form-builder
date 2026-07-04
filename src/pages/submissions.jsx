// src/pages/submissions.jsx
// Route: /submissions
// Real submission history: search by name/form, filter by date, view full details.

import { useMemo, useState } from "react";
import { useSubmissionStore } from "../store/submissionStore";
import { filterSubmissions } from "../store/submissionHelpers";
import SubmissionDetailModal from "../components/submissions/SubmissionDetailModal";

const DATE_FILTERS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
];

function Submissions() {
  const submissions = useSubmissionStore((s) => s.submissions);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const visible = useMemo(
    () => filterSubmissions(submissions, { search, dateFilter }),
    [submissions, search, dateFilter]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
      <p className="mt-2 text-gray-600">View submitted forms and their responses.</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or form…"
          className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        />
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        >
          {DATE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
            <span className="mb-2 text-3xl">📭</span>
            <p className="font-medium">No submissions yet</p>
          </div>
        ) : (
          visible.map((submission) => (
            <div
              key={submission.id}
              className="flex items-center justify-between border-b border-gray-100 p-4 last:border-b-0"
            >
              <div>
                <p className="font-medium text-gray-800">{submission.displayName}</p>
                <p className="text-sm text-gray-500">
                  {submission.formName} · {new Date(submission.submittedAt).toLocaleString()}
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

      <SubmissionDetailModal submission={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default Submissions;
