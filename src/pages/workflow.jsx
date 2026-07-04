// src/pages/workflow.jsx
// Route: /workflow
// Configure workflow definitions: name, add/edit/delete/reorder stages.
// Only the simulated Admin role can edit; other roles see a read-only view.

import { memo, useEffect, useMemo, useState } from "react";
import { useWorkflowStore } from "../store/workflowStore";
import { useCurrentUser } from "../store/authStore";
import { canConfigureWorkflows } from "../workflow/rolePermissions";
import { paginate } from "../utils/pagination";
import WorkflowStageEditor from "../components/workflow/WorkflowStageEditor";
import Badge from "../components/ui/badge";
import Button from "../components/ui/button";
import Spinner from "../components/ui/spinner";
import ErrorBanner from "../components/ui/errorBanner";
import EmptyState from "../components/ui/emptyState";
import Pagination from "../components/ui/pagination";

const PAGE_SIZE = 5;

const ReadOnlyWorkflowCard = memo(function ReadOnlyWorkflowCard({ workflow }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{workflow.workflowName}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {workflow.stages.map((stage) => (
          <Badge key={stage} text={stage} type="neutral" />
        ))}
      </div>
    </div>
  );
});

function Workflow() {
  const workflows = useWorkflowStore((s) => s.workflows);
  const isLoading = useWorkflowStore((s) => s.isLoading);
  const error = useWorkflowStore((s) => s.error);
  const fetchWorkflows = useWorkflowStore((s) => s.fetchWorkflows);
  const addWorkflow = useWorkflowStore((s) => s.addWorkflow);
  const removeWorkflow = useWorkflowStore((s) => s.removeWorkflow);
  const currentUser = useCurrentUser();
  const canConfigure = canConfigureWorkflows(currentUser.role);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { items: visible, totalPages } = useMemo(
    () => paginate(workflows, page, PAGE_SIZE),
    [workflows, page]
  );

  const handleCreate = () => {
    if (!newWorkflowName.trim()) return;
    addWorkflow(newWorkflowName.trim());
    setNewWorkflowName("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Workflow Configuration</h1>
      <p className="mt-1 text-gray-600">
        Design the stages a form progresses through — Draft, Submitted, Review, Approved,
        Rejected, or any custom set of your own.
      </p>

      {!canConfigure && (
        <p className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">
          You're viewing as <strong>{currentUser.role}</strong>. Only Admins can configure
          workflows.
        </p>
      )}

      {canConfigure && (
        <div className="mt-6 flex gap-2">
          <input
            type="text"
            value={newWorkflowName}
            onChange={(e) => setNewWorkflowName(e.target.value)}
            placeholder="New workflow name"
            className="flex-1 max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
          />
          <Button onClick={handleCreate}>+ New Workflow</Button>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <Spinner label="Loading workflows…" />
        ) : error ? (
          <ErrorBanner message={error} onRetry={fetchWorkflows} />
        ) : workflows.length === 0 ? (
          <EmptyState icon="🗂️" title="No workflows configured yet" />
        ) : canConfigure ? (
          visible.map((workflow) => (
            <WorkflowStageEditor
              key={workflow.id}
              workflow={workflow}
              onDelete={removeWorkflow}
            />
          ))
        ) : (
          visible.map((workflow) => (
            <ReadOnlyWorkflowCard key={workflow.id} workflow={workflow} />
          ))
        )}
      </div>

      {!isLoading && !error && workflows.length > 0 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}

export default Workflow;
