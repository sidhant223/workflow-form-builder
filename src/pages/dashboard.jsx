import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useSubmissionStore } from "../store/submissionStore";
import { useWorkflowStore } from "../store/workflowStore";
import {
  computeDashboardStats,
  computeFormsByStatus,
  computeWorkflowDistribution,
} from "../workflow/dashboardStats";
import { stageBadgeType } from "../components/submissions/SubmissionDetailModal";
import Badge from "../components/ui/badge";

const PIE_COLORS = ["#7c3aed", "#0ea5e9", "#f59e0b", "#ef4444", "#10b981", "#6b7280"];

function Dashboard() {
  const submissions = useSubmissionStore((s) => s.submissions);
  const workflows = useWorkflowStore((s) => s.workflows);

  const stats = computeDashboardStats(submissions);
  const formsByStatus = computeFormsByStatus(submissions);
  const workflowDistribution = computeWorkflowDistribution(submissions, workflows);
  const recentSubmissions = submissions.slice(0, 5);

  const kpiCards = [
    { title: "Pending Reviews", value: stats.pendingReviews, icon: "⏳" },
    { title: "Approved Today", value: stats.approvedToday, icon: "✅" },
    { title: "Rejected", value: stats.rejected, icon: "🚫" },
    { title: "Draft Forms", value: stats.draftForms, icon: "📝" },
  ];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Live workflow statistics across every submitted form.
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 text-xl">
                {item.icon}
              </div>
              <div>
                <p className="text-sm text-gray-600">{item.title}</p>
                <h2 className="text-2xl font-bold text-gray-900">{item.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Forms by Status</h2>
          {formsByStatus.length === 0 ? (
            <p className="text-sm text-gray-400">No submissions yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Workflow Distribution</h2>
          {workflowDistribution.length === 0 ? (
            <p className="text-sm text-gray-400">No submissions yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workflowDistribution}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
                    {workflowDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
          <Link to="/submissions" className="text-sm font-medium text-violet-600">
            View All
          </Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <p className="text-sm text-gray-400">No submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {recentSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-800">{submission.formName}</p>
                  <p className="text-sm text-gray-500">
                    {submission.displayName} ·{" "}
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
                {submission.stage && (
                  <Badge text={submission.stage} type={stageBadgeType(submission.stage)} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
