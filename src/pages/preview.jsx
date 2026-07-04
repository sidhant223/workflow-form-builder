// src/pages/preview.jsx
// Route: /preview
// Renders the final, interactive form via FormRenderer (react-hook-form-backed,
// validation + conditional fields + multi-step aware). On successful submit,
// records the response in the submission store and shows a Thank You screen.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useFormStore } from "../store/formStore";
import { useSubmissionStore } from "../store/submissionStore";
import { useWorkflowStore } from "../store/workflowStore";
import { useCurrentUser } from "../store/roleStore";
import { slugify } from "../utils/slugify";
import FormRenderer from "../renderer/FormRenderer";
import JSONViewer from "../components/viewer/JSONViewer";
import Button from "../components/ui/button";
import Toast from "../components/ui/toast";

function Preview() {
  const fields = useFormStore((s) => s.fields);
  const sections = useFormStore((s) => s.sections);
  const formName = useFormStore((s) => s.formName);
  const formDescription = useFormStore((s) => s.formDescription);
  const createdBy = useFormStore((s) => s.createdBy);
  const version = useFormStore((s) => s.version);
  const workflowId = useFormStore((s) => s.workflowId);
  const workflows = useWorkflowStore((s) => s.workflows);
  const addSubmission = useSubmissionStore((s) => s.addSubmission);
  const currentUser = useCurrentUser();
  const [submittedRecord, setSubmittedRecord] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const linkedWorkflow = workflows.find((w) => w.id === workflowId) || null;
  const schemaData = { formName, formDescription, createdBy, version, fields, sections, workflowId };

  const handleSubmit = (values) => {
    const record = addSubmission({
      formId: slugify(formName),
      formName: formName || "Untitled Form",
      responses: values,
      fields,
      workflowId,
      stages: linkedWorkflow ? linkedWorkflow.stages : [],
      submittedBy: currentUser.name,
    });
    setSubmittedRecord(record);
    setToastMessage("Form submitted successfully.");
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Form Preview</h1>
        <p className="mt-1 text-gray-600">
          This is exactly how your form will look and behave for end users.
        </p>
        <Link
          to="/form-builder"
          className="inline-block mt-3 text-sm font-medium text-violet-600 hover:underline"
        >
          ← Back to Builder
        </Link>
      </div>

      <div className="mx-auto max-w-xl">
        {submittedRecord ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
            <p className="text-2xl font-bold text-green-800">Thank You</p>
            <p className="mt-2 text-green-700">
              Your response has been submitted successfully.
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Reference Number:{" "}
              <span className="font-mono font-semibold text-gray-900">
                {submittedRecord.referenceNumber}
              </span>
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={() => setSubmittedRecord(null)}>
                Submit Another Response
              </Button>
              <Link to="/submissions">
                <Button variant="secondary">View Submissions</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            {formName && (
              <div className="mb-6 pb-6 border-b">
                <h1 className="text-2xl font-bold text-gray-900">{formName}</h1>
                {formDescription && <p className="mt-2 text-gray-600">{formDescription}</p>}
                {(createdBy || version) && (
                  <div className="mt-3 flex gap-4 text-xs text-gray-500">
                    {createdBy && <span>By: {createdBy}</span>}
                    {version && <span>v{version}</span>}
                  </div>
                )}
              </div>
            )}

            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
                <span className="mb-2 text-3xl">📭</span>
                <p className="font-medium text-gray-500">No form to preview yet</p>
                <p className="mb-4 text-sm text-gray-400">Add some fields in the builder first.</p>
                <Link to="/form-builder" className="text-sm font-medium text-violet-600 hover:underline">
                  Go to Form Builder →
                </Link>
              </div>
            ) : (
              <FormRenderer
                schema={fields}
                sections={sections}
                showSubmit
                submitLabel="Submit"
                onSubmit={handleSubmit}
              />
            )}
          </div>
        )}
      </div>

      <JSONViewer data={schemaData} />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}

export default Preview;
