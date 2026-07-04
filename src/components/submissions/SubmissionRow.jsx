// src/components/submissions/SubmissionRow.jsx
// A single row in the Submissions list. Memoized so typing in the search box
// (which re-renders the whole list) doesn't re-render rows whose underlying
// submission object hasn't changed.

import { memo } from "react";
import Badge from "../ui/badge";
import { stageBadgeType } from "../../workflow/stageBadge";

function SubmissionRow({ submission, onSelect }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 p-4 transition-colors last:border-b-0 hover:bg-gray-50">
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
        onClick={() => onSelect(submission)}
        className="text-sm font-medium text-violet-600 hover:underline"
      >
        View Details
      </button>
    </div>
  );
}

export default memo(SubmissionRow);
