import Badge from "../components/ui/badge";

const stages = [
  { name: "Draft", description: "Form is being designed", type: "neutral" },
  { name: "Submitted", description: "Awaiting reviewer action", type: "warning" },
  { name: "Approved", description: "Reviewed and accepted", type: "success" },
  { name: "Rejected", description: "Sent back for changes", type: "error" },
];

function Workflow() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Workflow</h1>
      <p className="mt-1 text-gray-600">
        Track each form as it moves through the approval workflow stages.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage) => (
          <div
            key={stage.name}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <Badge text={stage.name} type={stage.type} />
            <p className="mt-3 text-sm text-gray-600">{stage.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Workflow;
