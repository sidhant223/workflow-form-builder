// src/pages/pendingApprovals.jsx
// Route: /pending-approvals (Manager nav item)
// Thin wrapper around the shared Submissions list, pre-scoped to submissions
// that still need review.

import Submissions from "./submissions";

function PendingApprovals() {
  return <Submissions mode="pending" />;
}

export default PendingApprovals;
