// src/pages/preview.jsx
// Route: /preview
// Renders the final, interactive form straight from the builder schema using the
// same FormRenderer engine as the canvas — plus a working Submit button.
// (No validation yet — that lands in a later week.)

import { useState } from "react";
import { Link } from "react-router-dom";
import { useFormStore } from "../store/formStore";
import FormRenderer from "../renderer/FormRenderer";

function Preview() {
  const fields = useFormStore((s) => s.fields);
  const [submitted, setSubmitted] = useState(null);

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Form Preview</h1>
        <p className="mt-1 text-gray-600">
          This is exactly how your form will look and behave for end users.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">
            Generated Form
          </h2>

          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
              <span className="mb-2 text-3xl">📭</span>
              <p className="font-medium text-gray-500">No form to preview yet</p>
              <p className="mb-4 text-sm text-gray-400">
                Add some fields in the builder first.
              </p>
              <Link
                to="/form-builder"
                className="text-sm font-medium text-violet-600 hover:underline"
              >
                Go to Form Builder →
              </Link>
            </div>
          ) : (
            <FormRenderer
              schema={fields}
              showSubmit
              submitLabel="Submit"
              onSubmit={(values) => setSubmitted(values)}
            />
          )}
        </div>

        {/* Submitted payload — handy for the demo, proves data is captured. */}
        {submitted && (
          <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-green-800">✅ Form submitted</p>
              <button
                onClick={() => setSubmitted(null)}
                className="text-sm text-green-700 hover:underline"
              >
                Clear
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-white p-3 text-xs text-gray-700">
              {JSON.stringify(submitted, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default Preview;
