function Submissions() {
  const submissions = [
    { name: "Employee Onboarding Form", status: "Submitted" },
    { name: "Leave Request Form", status: "Approved" },
    { name: "Expense Approval Form", status: "Review" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
      <p className="mt-2 text-gray-600">
        View submitted forms and their current workflow status.
      </p>

      <div className="mt-6 rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        {submissions.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-gray-100 p-4 last:border-b-0"
          >
            <p className="font-medium text-gray-800">{item.name}</p>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-700">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Submissions;