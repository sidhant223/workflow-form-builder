import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const kpiData = [
  {
    title: "Total Forms",
    value: 12,
    change: "+12% from last week",
    icon: "📄",
  },
  {
    title: "Pending Reviews",
    value: 5,
    change: "+5% from last week",
    icon: "⏳",
  },
  {
    title: "Completed Workflows",
    value: 20,
    change: "+22% from last week",
    icon: "✅",
  },
];

const submissionsData = [
  { day: "Mon", submissions: 22 },
  { day: "Tue", submissions: 48 },
  { day: "Wed", submissions: 50 },
  { day: "Thu", submissions: 78 },
  { day: "Fri", submissions: 53 },
  { day: "Sat", submissions: 36 },
  { day: "Sun", submissions: 24 },
];

const recentForms = [
  "Employee Onboarding Form",
  "Leave Request Form",
  "Expense Approval Form",
];

const workflowStats = [
  { label: "Draft", value: 5 },
  { label: "Submitted", value: 10 },
  { label: "Approved", value: 3 },
];

function Dashboard() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome back, Admin! Here's what's happening with your forms and
          workflows.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {kpiData.map((item) => (
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
                <h2 className="text-2xl font-bold text-gray-900">
                  {item.value}
                </h2>
                <p className="mt-1 text-xs text-green-600">{item.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Forms
            </h2>
            <button className="text-sm font-medium text-violet-600">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentForms.map((form, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-800">{form}</p>
                  <p className="text-sm text-gray-500">
                    Updated {index + 1} day ago
                  </p>
                </div>
                <span className="text-gray-400">⋮</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Submissions Overview
            </h2>

            <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={submissionsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Workflow Status
          </h2>
          <button className="text-sm font-medium text-violet-600">
            View Workflow
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {workflowStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-100 p-4"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;