function Preview() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Preview</h1>
      <p className="mt-2 text-gray-600">
        Preview created forms before publishing or submitting.
      </p>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold">Employee Onboarding Form</h2>

        <div className="mt-4 space-y-4">
          <input
            className="w-full rounded-lg border border-gray-300 p-3"
            placeholder="Employee Name"
          />
          <input
            className="w-full rounded-lg border border-gray-300 p-3"
            placeholder="Email Address"
          />
          <select className="w-full rounded-lg border border-gray-300 p-3">
            <option>Select Department</option>
            <option>HR</option>
            <option>IT</option>
            <option>Finance</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Preview;