// src/components/workflow/WorkflowTimeline.jsx
// Visualizes a submission's lifecycle: reached stages filled in, the current
// or default-expected next stage shown pending, with date/time/user/comment
// for each stage actually reached.

import { getTimelineStages } from "../../workflow/workflowTransitions";

export default function WorkflowTimeline({ stages = [], history = [], currentStage }) {
  const timelineStages = getTimelineStages(stages, history);

  return (
    <div>
      {timelineStages.map((stage, index) => {
        const entry = history.find((h) => h.stage === stage);
        const isReached = !!entry;
        const isCurrent = stage === currentStage;
        const isLast = index === timelineStages.length - 1;

        return (
          <div key={stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={isReached ? "text-violet-600" : "text-gray-300"}>
                {isReached ? "●" : "○"}
              </span>
              {!isLast && <span className="flex-1 border-l border-gray-300" />}
            </div>
            <div className={`pb-4 ${isLast ? "" : ""}`}>
              <p
                className={
                  isCurrent
                    ? "font-semibold text-violet-700"
                    : isReached
                      ? "font-medium text-gray-800"
                      : "text-gray-400"
                }
              >
                {stage}
              </p>
              {entry && (
                <>
                  <p className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleString()} · {entry.user}
                  </p>
                  {entry.comment && (
                    <p className="mt-1 text-xs italic text-gray-600">"{entry.comment}"</p>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
