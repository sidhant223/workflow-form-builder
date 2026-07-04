// src/renderer/FormRenderer.jsx
// The Dynamic Form Renderer — schema in, live react-hook-form-backed inputs out.
// Owns validation (via the validation engine), conditional visibility, and
// optional multi-step navigation with an auto-appended review step.

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DynamicField from "./DynamicField";
import Button from "../components/ui/button";
import { getValidationRules } from "../validation/buildValidationRules";
import { isFieldVisible } from "./conditionalVisibility";
import { groupFieldsBySection } from "./formSteps";

function seedValue(field) {
  if (field.defaultValue !== undefined && field.defaultValue !== "") {
    return field.defaultValue;
  }
  return field.type === "checkbox" ? false : "";
}

function buildDefaultValues(schema) {
  return schema.reduce((acc, field) => {
    acc[field.id] = seedValue(field);
    return acc;
  }, {});
}

export default function FormRenderer({
  schema = [],
  sections = [],
  disabled = false,
  showSubmit = false,
  submitLabel = "Submit",
  onSubmit,
  emptyMessage = "No fields added yet",
}) {
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    getValues,
    unregister,
    formState: { errors },
  } = useForm({ defaultValues: buildDefaultValues(schema) });

  const watchedValues = watch();
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => groupFieldsBySection(schema, sections), [schema, sections]);
  const isMultiStep = sections.length > 0;
  const totalSteps = isMultiStep ? steps.length + 1 : 1; // +1 for the auto review step
  const isReviewStep = isMultiStep && stepIndex === steps.length;

  // Drop validation rules (but keep the entered value) for any field whose
  // showIf condition currently hides it — otherwise a hidden required field
  // would still block submission, since react-hook-form retains a field's
  // rules across unmounts by default (needed so multi-step values persist
  // across steps).
  useEffect(() => {
    schema.forEach((field) => {
      if (!isFieldVisible(field, watchedValues)) {
        unregister(field.id, { keepValue: true, keepError: false });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  if (!schema.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-400">
        <span className="mb-2 text-3xl">🗒️</span>
        <p className="font-medium text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  const renderField = (field) => {
    if (!isFieldVisible(field, watchedValues)) return null;

    return (
      <Controller
        key={field.id}
        name={field.id}
        control={control}
        rules={getValidationRules(field)}
        render={({ field: { onChange, value } }) => (
          <DynamicField
            field={field}
            value={value}
            onChange={(next) =>
              onChange(field.type === "number" && next !== "" ? Number(next) : next)
            }
            error={errors[field.id]?.message}
            disabled={disabled}
          />
        )}
      />
    );
  };

  const currentStepFields = isMultiStep && !isReviewStep ? steps[stepIndex].fields : schema;

  const goNext = async () => {
    const visibleNames = currentStepFields
      .filter((field) => isFieldVisible(field, watchedValues))
      .map((field) => field.id);
    const valid = await trigger(visibleNames);
    if (valid) setStepIndex((i) => i + 1);
  };

  const goPrevious = () => setStepIndex((i) => Math.max(0, i - 1));

  const handleFormKeyDown = (event) => {
    if (event.key === "Enter" && isMultiStep && !isReviewStep) {
      event.preventDefault();
    }
  };

  const submitHandler = (values) => {
    if (onSubmit) onSubmit(values);
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      onKeyDown={handleFormKeyDown}
      noValidate
      className="space-y-5"
    >
      {isMultiStep && (
        <div className="mb-2">
          <p className="text-sm font-medium text-gray-500">
            Step {stepIndex + 1} of {totalSteps}
            {!isReviewStep && steps[stepIndex].name ? ` — ${steps[stepIndex].name}` : ""}
            {isReviewStep ? " — Review & Submit" : ""}
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-violet-600 transition-all"
              style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {isReviewStep ? (
        <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          {schema
            .filter((field) => isFieldVisible(field, watchedValues))
            .map((field) => (
              <div
                key={field.id}
                className="flex justify-between gap-4 border-b border-gray-100 pb-2 text-sm last:border-b-0"
              >
                <span className="font-medium text-gray-600">{field.label}</span>
                <span className="text-gray-900">
                  {field.type === "checkbox"
                    ? getValues(field.id)
                      ? "Yes"
                      : "No"
                    : String(getValues(field.id) ?? "") || "—"}
                </span>
              </div>
            ))}
        </div>
      ) : (
        (isMultiStep ? steps[stepIndex].fields : schema).map(renderField)
      )}

      {isMultiStep ? (
        <div className="flex items-center justify-between pt-2">
          <Button type="button" variant="outline" onClick={goPrevious} disabled={stepIndex === 0}>
            Previous
          </Button>
          {isReviewStep ? (
            showSubmit && <Button type="submit">{submitLabel}</Button>
          ) : (
            <Button type="button" onClick={goNext}>
              Next
            </Button>
          )}
        </div>
      ) : (
        showSubmit && (
          <div className="pt-2">
            <Button type="submit" size="lg">
              {submitLabel}
            </Button>
          </div>
        )
      )}
    </form>
  );
}
