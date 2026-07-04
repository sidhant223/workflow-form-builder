// src/pages/mySubmissions.jsx
// Route: /my-submissions (Employee nav item)
// Thin wrapper around the shared Submissions list, pre-scoped to forms the
// current simulated user submitted themselves.

import Submissions from "./submissions";

function MySubmissions() {
  return <Submissions mode="mine" />;
}

export default MySubmissions;
