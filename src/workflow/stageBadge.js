// src/workflow/stageBadge.js
// Maps a workflow stage name to the existing Badge component's `type` prop.

export function stageBadgeType(stage) {
  if (!stage) return "neutral";
  const lower = stage.toLowerCase();
  if (lower === "approved") return "success";
  if (lower === "rejected") return "error";
  if (lower === "draft") return "neutral";
  return "warning";
}
