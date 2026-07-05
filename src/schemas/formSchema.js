// src/schemas/formSchema.js
// -----------------------------------------------------------------------------
// Reusable JSON schema model for the Dynamic Form Builder.
//
// A form is just an array of *field* objects. Each field follows this shape:
//
//   {
//     id: "field_1",          // unique id, auto-generated
//     type: "text",           // one of FIELD_TYPES below
//     label: "Full Name",     // shown above the input
//     placeholder: "Enter…",  // hint text inside the input
//     required: true,         // shows a "*" and marks the input required
//     defaultValue: "",       // value pre-filled when the form first renders
//     options: ["A", "B"],    // ONLY for "select" and "radio" fields
//   }
//
// The renderer reads this schema and decides which React component to mount,
// so adding a new field type is a matter of extending FIELD_TYPES + the
// registry — no hard-coded <input/> tags anywhere.
// -----------------------------------------------------------------------------

// Field types that need a list of choices.
export const OPTION_FIELD_TYPES = ["select", "radio"];

// Catalogue of every supported field type. The Form Builder palette and the
// field registry are both generated from this single source of truth.
export const FIELD_TYPES = [
  { type: "text", label: "Text Input", icon: "📝", placeholder: "Enter text" },
  { type: "email", label: "Email", icon: "✉️", placeholder: "name@example.com" },
  { type: "number", label: "Number", icon: "🔢", placeholder: "Enter a number" },
  { type: "password", label: "Password", icon: "🔒", placeholder: "Enter password" },
  { type: "textarea", label: "Textarea", icon: "📄", placeholder: "Enter details" },
  { type: "select", label: "Dropdown", icon: "🔽", placeholder: "Select an option" },
  { type: "checkbox", label: "Checkbox", icon: "☑️", placeholder: "" },
  { type: "radio", label: "Radio", icon: "🔘", placeholder: "" },
  { type: "date", label: "Date", icon: "📅", placeholder: "" },
];

// Quick lookup: type -> meta entry (e.g. FIELD_TYPE_MAP.text.label).
const FIELD_TYPE_MAP = FIELD_TYPES.reduce((map, meta) => {
  map[meta.type] = meta;
  return map;
}, {});

// Does this field type carry an `options` array?
const hasOptions = (type) => OPTION_FIELD_TYPES.includes(type);

/**
 * Factory that builds a brand-new field with sensible defaults for its type.
 * `id` is injected by the caller (the store) so ids stay unique & predictable.
 */
export function createField(type, id) {
  const meta = FIELD_TYPE_MAP[type] || FIELD_TYPE_MAP.text;

  const field = {
    id,
    type: meta.type,
    label: "Untitled Field",
    placeholder: meta.placeholder || "",
    required: false,
    defaultValue: meta.type === "checkbox" ? false : "",
    helpText: "",
    // Validation (Week 5)
    minLength: undefined,
    maxLength: undefined,
    min: undefined,
    max: undefined,
    pattern: "",
    patternMessage: "",
    // Conditional visibility (Week 5)
    showIf: null,
    // Multi-step assignment (Week 5)
    sectionId: null,
  };

  if (hasOptions(meta.type)) {
    field.options = ["Option 1", "Option 2", "Option 3"];
  }

  return field;
}

// -----------------------------------------------------------------------------
// Example schema — used by the Form Builder's "Load Sample" button.
// -----------------------------------------------------------------------------

export const exampleEmployeeForm = [
  {
    id: "field_emp_name",
    type: "text",
    label: "Name",
    placeholder: "Enter employee name",
    required: true,
    defaultValue: "",
  },
  {
    id: "field_emp_email",
    type: "email",
    label: "Email",
    placeholder: "name@company.com",
    required: true,
    defaultValue: "",
  },
  {
    id: "field_emp_dept",
    type: "select",
    label: "Department",
    placeholder: "Select department",
    required: true,
    defaultValue: "",
    options: ["Engineering", "Design", "HR", "Finance"],
  },
  {
    id: "field_emp_start",
    type: "date",
    label: "Start Date",
    placeholder: "",
    required: false,
    defaultValue: "",
  },
];
