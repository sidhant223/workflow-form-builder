function FormBuilder() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
      <p className="mt-2 text-gray-600">
        Create and manage dynamic forms using JSON-based schemas.
      </p>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold">Dynamic Form Builder</h2>
        <p className="mt-2 text-gray-600">
          This section will allow users to add fields like text input, dropdowns,
          checkboxes, date pickers, and validations.
        </p>
      </div>
    </div>
  );
}

export default FormBuilder;