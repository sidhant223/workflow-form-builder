# Week 5 Form Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Week 1–4 form builder into a working form engine: dynamic validation, real submission handling, conditional fields, multi-step forms, templates, a real submissions page, and a polished preview/success flow.

**Architecture:** Pure, dependency-free logic (validation-rule generation, conditional visibility, step grouping, submission helpers) lives in small standalone modules with Vitest unit tests. `FormRenderer` is rebuilt on `react-hook-form`'s `useForm`/`Controller` and consumes those pure modules; it gets Testing-Library tests because it's the highest-weighted, highest-risk piece (validation + conditional + multi-step all interact there). Page-level wiring (property panel additions, template picker, submissions page) is thin glue over already-tested logic and is verified manually in the browser, per the project's "test frontend changes in a real browser" convention — there is no component-test harness in this repo prior to this plan, and standing one up fully for every page would be disproportionate to a 16-task, single-sprint feature add.

**Tech Stack:** React 19, Vite 8, Zustand 5 (+ `persist` middleware), Tailwind 4, react-router 7, **new:** `react-hook-form`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.

## Global Constraints

- Single-form model: the app builds and previews **one form at a time** (existing `formStore.js` global schema). "Submissions" are fill-instances of that one form, not a multi-form library. Do not introduce multi-form CRUD.
- No backend. All persistence is `localStorage` via Zustand `persist`, matching the existing `form-builder-schema` key convention.
- Field validation properties live flat on the field object (`required`, `minLength`, `maxLength`, `min`, `max`, `pattern`, `patternMessage`), matching the PDF's example schema exactly — no nested `validation: {}` object.
- Email format validation is automatic for `type: "email"` fields — no separate enable/disable toggle.
- `FormRenderer` is the only consumer of `DynamicField`; `DynamicField` is the only consumer of the field-registry components. Changing `DynamicField`'s `onChange` contract in this plan is safe because both call sites are rewritten together.
- Multi-step forms reuse the existing `sections` array in `formStore.js` (`addSection`/`updateSection`/`removeSection` already exist) — `sectionId` is added to fields to assign them to a step. `sections.length === 0` must always render the existing single-page behavior, unchanged, for backward compatibility with every already-saved form.
- Error message copy must match the PDF exactly where it specifies exact text: `"Name is required"` pattern (`"<Label> is required"`), `"Minimum 3 characters"`, `"Maximum 50 characters"`, `"Invalid email address"`, `"Minimum: 1"` / `"Maximum: 100"`.
- Follow existing code style: functional components, no PropTypes, Tailwind utility classes matching the violet/gray palette already used throughout, emoji icons for empty/aux states (matches existing convention).
- Run `npm install` from `workflow-form-builder/` (that's the actual app root — the outer `Dynamic Form` folder is just a container).

---

### Task 1: Testing infrastructure + react-hook-form

**Files:**
- Modify: `workflow-form-builder/package.json`
- Create: `workflow-form-builder/vitest.config.js`
- Create: `workflow-form-builder/src/test/setup.js`
- Create: `workflow-form-builder/src/test/smoke.test.js`

**Interfaces:**
- Produces: a working `npm run test` (Vitest, jsdom environment, Testing-Library jest-dom matchers loaded) and `react-hook-form` available to import from any subsequent task.

- [ ] **Step 1: Install dependencies**

Run from `workflow-form-builder/`:

```bash
npm install react-hook-form
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Add test scripts to `package.json`**

In `workflow-form-builder/package.json`, the `"scripts"` block currently reads:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
```

Change it to:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 3: Create the Vitest config**

Create `workflow-form-builder/vitest.config.js`:

```js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    globals: false,
  },
});
```

- [ ] **Step 4: Create the test setup file**

Create `workflow-form-builder/src/test/setup.js`:

```js
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Write a trivial smoke test**

Create `workflow-form-builder/src/test/smoke.test.js`:

```js
import { describe, it, expect } from "vitest";

describe("test toolchain", () => {
  it("runs a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("has jsdom's localStorage available", () => {
    localStorage.setItem("x", "1");
    expect(localStorage.getItem("x")).toBe("1");
    localStorage.clear();
  });
});
```

- [ ] **Step 6: Run it**

Run: `npm run test`
Expected: `2 passed` (or similar), no config errors. If Vitest/Vite version conflicts appear, resolve them now — every later task depends on this working.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.js src/test/setup.js src/test/smoke.test.js
git commit -m "chore: add vitest + testing-library + react-hook-form"
```

---

### Task 2: `slugify` utility

**Files:**
- Create: `workflow-form-builder/src/utils/slugify.js`
- Test: `workflow-form-builder/src/utils/slugify.test.js`

**Interfaces:**
- Produces: `slugify(text, fallback = "untitled_form") => string`, used by Task 16 (preview.jsx) to derive `formId`.

- [ ] **Step 1: Write the failing test**

Create `workflow-form-builder/src/utils/slugify.test.js`:

```js
import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and underscores spaces", () => {
    expect(slugify("Employee Registration")).toBe("employee_registration");
  });

  it("strips punctuation into underscores", () => {
    expect(slugify("Sam's Form! v2.0")).toBe("sam_s_form_v2_0");
  });

  it("falls back to untitled_form when empty or blank", () => {
    expect(slugify("")).toBe("untitled_form");
    expect(slugify("   ")).toBe("untitled_form");
    expect(slugify(undefined)).toBe("untitled_form");
  });

  it("accepts a custom fallback", () => {
    expect(slugify("", "custom_default")).toBe("custom_default");
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test -- slugify`
Expected: FAIL — `Cannot find module './slugify'`.

- [ ] **Step 3: Implement it**

Create `workflow-form-builder/src/utils/slugify.js`:

```js
export function slugify(text, fallback = "untitled_form") {
  if (!text) return fallback;

  const slug = text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return slug || fallback;
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm run test -- slugify`
Expected: `4 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/utils/slugify.js src/utils/slugify.test.js
git commit -m "feat: add slugify utility for deriving formId"
```

---

### Task 3: Extend the field schema model

**Files:**
- Modify: `workflow-form-builder/src/schemas/formSchema.js`
- Test: `workflow-form-builder/src/schemas/formSchema.test.js`

**Interfaces:**
- Produces: `createField(type, id)` now also returns `minLength: undefined`, `maxLength: undefined`, `min: undefined`, `max: undefined`, `pattern: ""`, `patternMessage: ""`, `showIf: null`, `sectionId: null` alongside the existing properties. These are the exact property names Tasks 4–17 read/write.

- [ ] **Step 1: Write the failing test**

Create `workflow-form-builder/src/schemas/formSchema.test.js`:

```js
import { describe, it, expect } from "vitest";
import { createField } from "./formSchema";

describe("createField", () => {
  it("includes the new validation, conditional, and step properties", () => {
    const field = createField("text", "field_1");

    expect(field).toMatchObject({
      id: "field_1",
      type: "text",
      required: false,
      minLength: undefined,
      maxLength: undefined,
      min: undefined,
      max: undefined,
      pattern: "",
      patternMessage: "",
      showIf: null,
      sectionId: null,
    });
  });

  it("still attaches options for select/radio fields", () => {
    const field = createField("select", "field_2");
    expect(field.options).toEqual(["Option 1", "Option 2", "Option 3"]);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test -- formSchema`
Expected: FAIL — `patternMessage`/`showIf`/`sectionId` etc. are `undefined` where the object is missing the keys (object shape mismatch), or the test fails on `toMatchObject` because those keys are absent.

- [ ] **Step 3: Implement it**

In `workflow-form-builder/src/schemas/formSchema.js`, replace the `createField` function body:

```js
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
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm run test -- formSchema`
Expected: `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/schemas/formSchema.js src/schemas/formSchema.test.js
git commit -m "feat: extend field schema with validation, conditional, and step properties"
```

---

### Task 4: Validation engine (`buildValidationRules.js`)

**Files:**
- Create: `workflow-form-builder/src/validation/buildValidationRules.js`
- Test: `workflow-form-builder/src/validation/buildValidationRules.test.js`

**Interfaces:**
- Consumes: field objects shaped per Task 3 (`required`, `minLength`, `maxLength`, `min`, `max`, `pattern`, `patternMessage`, `type`, `label`).
- Produces: `getValidationRules(field) => RHF rules object` (`{ required?, minLength?, maxLength?, min?, max?, validate? }`), consumed directly as a `<Controller rules={...}>` prop in Task 11. Also exports `EMAIL_REGEX`.

- [ ] **Step 1: Write the failing test**

Create `workflow-form-builder/src/validation/buildValidationRules.test.js`:

```js
import { describe, it, expect } from "vitest";
import { getValidationRules } from "./buildValidationRules";

describe("getValidationRules", () => {
  it("adds a required message using the field label", () => {
    const rules = getValidationRules({ type: "text", label: "Full Name", required: true });
    expect(rules.required).toBe("Full Name is required");
  });

  it("omits required when the field isn't required", () => {
    const rules = getValidationRules({ type: "text", label: "Full Name", required: false });
    expect(rules.required).toBeUndefined();
  });

  it("adds minLength/maxLength messages for text-like fields", () => {
    const rules = getValidationRules({
      type: "text",
      label: "Full Name",
      minLength: 3,
      maxLength: 50,
    });
    expect(rules.minLength).toEqual({ value: 3, message: "Minimum 3 characters" });
    expect(rules.maxLength).toEqual({ value: 50, message: "Maximum 50 characters" });
  });

  it("adds min/max messages for number fields", () => {
    const rules = getValidationRules({ type: "number", label: "Age", min: 1, max: 100 });
    expect(rules.min).toEqual({ value: 1, message: "Minimum: 1" });
    expect(rules.max).toEqual({ value: 100, message: "Maximum: 100" });
  });

  it("validates email format for type=email", () => {
    const rules = getValidationRules({ type: "email", label: "Email" });
    expect(rules.validate.email("jane@test.com")).toBe(true);
    expect(rules.validate.email("not-an-email")).toBe("Invalid email address");
    expect(rules.validate.email("")).toBe(true);
  });

  it("validates a custom regex pattern with a custom message", () => {
    const rules = getValidationRules({
      type: "text",
      label: "Mobile Number",
      pattern: "^[0-9]{10}$",
      patternMessage: "10 digits only",
    });
    expect(rules.validate.pattern("1234567890")).toBe(true);
    expect(rules.validate.pattern("abc")).toBe("10 digits only");
  });

  it("falls back to a generic message when no patternMessage is set", () => {
    const rules = getValidationRules({ type: "text", label: "Code", pattern: "^[A-Z]+$" });
    expect(rules.validate.pattern("abc")).toBe("Invalid format");
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test -- buildValidationRules`
Expected: FAIL — `Cannot find module './buildValidationRules'`.

- [ ] **Step 3: Implement it**

Create `workflow-form-builder/src/validation/buildValidationRules.js`:

```js
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LENGTH_AWARE_TYPES = ["text", "textarea", "password", "email"];

export function getValidationRules(field) {
  const rules = {};
  const label = field.label || "This field";

  if (field.required) {
    rules.required = `${label} is required`;
  }

  if (LENGTH_AWARE_TYPES.includes(field.type)) {
    if (field.minLength) {
      rules.minLength = {
        value: Number(field.minLength),
        message: `Minimum ${field.minLength} characters`,
      };
    }
    if (field.maxLength) {
      rules.maxLength = {
        value: Number(field.maxLength),
        message: `Maximum ${field.maxLength} characters`,
      };
    }
  }

  if (field.type === "number") {
    if (field.min !== undefined && field.min !== "") {
      rules.min = { value: Number(field.min), message: `Minimum: ${field.min}` };
    }
    if (field.max !== undefined && field.max !== "") {
      rules.max = { value: Number(field.max), message: `Maximum: ${field.max}` };
    }
  }

  const validate = {};

  if (field.type === "email") {
    validate.email = (value) => !value || EMAIL_REGEX.test(value) || "Invalid email address";
  }

  if (field.pattern && field.type !== "email") {
    validate.pattern = (value) => {
      if (!value) return true;
      try {
        return (
          new RegExp(field.pattern).test(value) || field.patternMessage || "Invalid format"
        );
      } catch {
        return true;
      }
    };
  }

  if (Object.keys(validate).length > 0) {
    rules.validate = validate;
  }

  return rules;
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm run test -- buildValidationRules`
Expected: `7 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/validation/buildValidationRules.js src/validation/buildValidationRules.test.js
git commit -m "feat: add schema-driven validation rules engine"
```

---

### Task 5: Conditional-visibility helper

**Files:**
- Create: `workflow-form-builder/src/renderer/conditionalVisibility.js`
- Test: `workflow-form-builder/src/renderer/conditionalVisibility.test.js`

**Interfaces:**
- Consumes: a field's `showIf: { field, value } | null` (Task 3) and a `values` map keyed by field id (RHF's `watch()` output).
- Produces: `isFieldVisible(field, values) => boolean`, used by `FormRenderer` (Task 11) and `ConditionalPanel` (Task 13).

- [ ] **Step 1: Write the failing test**

Create `workflow-form-builder/src/renderer/conditionalVisibility.test.js`:

```js
import { describe, it, expect } from "vitest";
import { isFieldVisible } from "./conditionalVisibility";

describe("isFieldVisible", () => {
  it("is always visible when there is no showIf", () => {
    expect(isFieldVisible({ showIf: null }, {})).toBe(true);
    expect(isFieldVisible({}, {})).toBe(true);
  });

  it("is visible when the target field's value matches", () => {
    const field = { showIf: { field: "employment", value: "Yes" } };
    expect(isFieldVisible(field, { employment: "Yes" })).toBe(true);
  });

  it("is hidden when the target field's value doesn't match", () => {
    const field = { showIf: { field: "employment", value: "Yes" } };
    expect(isFieldVisible(field, { employment: "No" })).toBe(false);
    expect(isFieldVisible(field, {})).toBe(false);
  });

  it("compares boolean checkbox values against string configuration", () => {
    const field = { showIf: { field: "subscribe", value: "true" } };
    expect(isFieldVisible(field, { subscribe: true })).toBe(true);
    expect(isFieldVisible(field, { subscribe: false })).toBe(false);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test -- conditionalVisibility`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement it**

Create `workflow-form-builder/src/renderer/conditionalVisibility.js`:

```js
export function isFieldVisible(field, values = {}) {
  if (!field.showIf || !field.showIf.field) return true;
  const actual = values[field.showIf.field];
  return String(actual ?? "") === String(field.showIf.value ?? "");
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm run test -- conditionalVisibility`
Expected: `4 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/renderer/conditionalVisibility.js src/renderer/conditionalVisibility.test.js
git commit -m "feat: add conditional field visibility helper"
```

---

### Task 6: Multi-step grouping helper (`formSteps.js`)

**Files:**
- Create: `workflow-form-builder/src/renderer/formSteps.js`
- Test: `workflow-form-builder/src/renderer/formSteps.test.js`

**Interfaces:**
- Consumes: `fields` (array of field objects with `sectionId`, Task 3) and `sections` (`{ id, name, fields }[]`, existing `formStore.js` shape).
- Produces: `groupFieldsBySection(fields, sections) => { id, name, fields }[]`, used by `FormRenderer` (Task 11).

- [ ] **Step 1: Write the failing test**

Create `workflow-form-builder/src/renderer/formSteps.test.js`:

```js
import { describe, it, expect } from "vitest";
import { groupFieldsBySection } from "./formSteps";

const fields = [
  { id: "f1", sectionId: "s1" },
  { id: "f2", sectionId: "s2" },
  { id: "f3", sectionId: "s1" },
  { id: "f4", sectionId: null },
];

const sections = [
  { id: "s1", name: "Personal Information" },
  { id: "s2", name: "Employment Information" },
];

describe("groupFieldsBySection", () => {
  it("returns a single unnamed group when there are no sections", () => {
    const groups = groupFieldsBySection(fields, []);
    expect(groups).toEqual([{ id: null, name: null, fields }]);
  });

  it("buckets fields into their assigned section, preserving section order", () => {
    const groups = groupFieldsBySection(fields, sections);
    expect(groups).toEqual([
      { id: "s1", name: "Personal Information", fields: [fields[0], fields[2], fields[3]] },
      { id: "s2", name: "Employment Information", fields: [fields[1]] },
    ]);
  });

  it("falls back a field with an unknown sectionId into the first section", () => {
    const withUnknown = [{ id: "f5", sectionId: "does-not-exist" }];
    const groups = groupFieldsBySection(withUnknown, sections);
    expect(groups[0].fields).toEqual(withUnknown);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test -- formSteps`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement it**

Create `workflow-form-builder/src/renderer/formSteps.js`:

```js
export function groupFieldsBySection(fields, sections = []) {
  if (!sections.length) {
    return [{ id: null, name: null, fields }];
  }

  const firstId = sections[0].id;
  const buckets = new Map(sections.map((s) => [s.id, []]));

  fields.forEach((field) => {
    const key = buckets.has(field.sectionId) ? field.sectionId : firstId;
    buckets.get(key).push(field);
  });

  return sections.map((s) => ({ id: s.id, name: s.name, fields: buckets.get(s.id) }));
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm run test -- formSteps`
Expected: `3 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/renderer/formSteps.js src/renderer/formSteps.test.js
git commit -m "feat: add multi-step field grouping helper"
```

---

### Task 7: Submission helpers (pure functions)

**Files:**
- Create: `workflow-form-builder/src/store/submissionHelpers.js`
- Test: `workflow-form-builder/src/store/submissionHelpers.test.js`

**Interfaces:**
- Produces: `formatReferenceNumber(n) => string`, `extractDisplayName(responses, fields) => string`, `filterSubmissions(submissions, { search, dateFilter, now }) => array`. Consumed by `submissionStore.js` (Task 8) and `submissions.jsx` (Task 17).

- [ ] **Step 1: Write the failing test**

Create `workflow-form-builder/src/store/submissionHelpers.test.js`:

```js
import { describe, it, expect } from "vitest";
import {
  formatReferenceNumber,
  extractDisplayName,
  filterSubmissions,
} from "./submissionHelpers";

describe("formatReferenceNumber", () => {
  it("zero-pads to 6 digits with a FORM- prefix", () => {
    expect(formatReferenceNumber(1)).toBe("FORM-000001");
    expect(formatReferenceNumber(123)).toBe("FORM-000123");
  });
});

describe("extractDisplayName", () => {
  const fields = [
    { id: "f_name", type: "text" },
    { id: "f_email", type: "email" },
  ];

  it("picks the first text/email field with a value", () => {
    expect(extractDisplayName({ f_name: "Jane Doe", f_email: "jane@test.com" }, fields)).toBe(
      "Jane Doe"
    );
  });

  it("falls back to Anonymous when no text/email field has a value", () => {
    expect(extractDisplayName({ f_name: "", f_email: "" }, fields)).toBe("Anonymous");
  });
});

describe("filterSubmissions", () => {
  const now = 1_700_000_000_000; // fixed reference instant
  const submissions = [
    {
      id: "1",
      displayName: "Jane Doe",
      formName: "Employee Form",
      submittedAt: new Date(now).toISOString(),
    },
    {
      id: "2",
      displayName: "Alice Smith",
      formName: "Leave Form",
      submittedAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  it("matches search against displayName and formName, case-insensitively", () => {
    expect(filterSubmissions(submissions, { search: "jane", now })).toEqual([submissions[0]]);
    expect(filterSubmissions(submissions, { search: "leave", now })).toEqual([submissions[1]]);
  });

  it("filters by date window using the injected `now`", () => {
    expect(filterSubmissions(submissions, { dateFilter: "7days", now })).toEqual([
      submissions[0],
    ]);
    expect(filterSubmissions(submissions, { dateFilter: "30days", now })).toEqual(submissions);
  });

  it("returns everything for dateFilter 'all' and empty search", () => {
    expect(filterSubmissions(submissions, { now })).toEqual(submissions);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test -- submissionHelpers`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement it**

Create `workflow-form-builder/src/store/submissionHelpers.js`:

```js
const NAME_LIKE_TYPES = ["text", "email"];
const DAY_MS = 24 * 60 * 60 * 1000;
const FILTER_DAYS = { today: 1, "7days": 7, "30days": 30 };

export function formatReferenceNumber(n) {
  return `FORM-${String(n).padStart(6, "0")}`;
}

export function extractDisplayName(responses, fields) {
  const candidate = fields.find((f) => NAME_LIKE_TYPES.includes(f.type) && responses[f.id]);
  return candidate ? String(responses[candidate.id]) : "Anonymous";
}

export function filterSubmissions(
  submissions,
  { search = "", dateFilter = "all", now = Date.now() } = {}
) {
  const term = search.trim().toLowerCase();

  return submissions.filter((submission) => {
    const matchesSearch =
      !term ||
      submission.displayName.toLowerCase().includes(term) ||
      submission.formName.toLowerCase().includes(term);

    if (!matchesSearch) return false;
    if (dateFilter === "all") return true;

    const days = FILTER_DAYS[dateFilter];
    if (!days) return true;

    const submittedAt = new Date(submission.submittedAt).getTime();
    return submittedAt >= now - days * DAY_MS;
  });
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm run test -- submissionHelpers`
Expected: `5 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/store/submissionHelpers.js src/store/submissionHelpers.test.js
git commit -m "feat: add submission reference-number, naming, and filter helpers"
```

---

### Task 8: Submission store

**Files:**
- Create: `workflow-form-builder/src/store/submissionStore.js`
- Test: `workflow-form-builder/src/store/submissionStore.test.js`

**Interfaces:**
- Consumes: `formatReferenceNumber`, `extractDisplayName` from Task 7.
- Produces: `useSubmissionStore` (Zustand hook) with state `{ submissions, nextRefNumber }` and action `addSubmission({ formId, formName, responses, fields }) => record`, where `record = { id, formId, formName, displayName, submittedAt, responses, referenceNumber }`. Consumed by `preview.jsx` (Task 16) and `submissions.jsx` (Task 17).

- [ ] **Step 1: Write the failing test**

Create `workflow-form-builder/src/store/submissionStore.test.js`:

```js
import { describe, it, expect, beforeEach } from "vitest";
import { useSubmissionStore } from "./submissionStore";

const FIELDS = [
  { id: "field_1", type: "text", label: "Name" },
  { id: "field_2", type: "email", label: "Email" },
];

beforeEach(() => {
  useSubmissionStore.setState({ submissions: [], nextRefNumber: 1 });
  localStorage.clear();
});

describe("useSubmissionStore", () => {
  it("records a submission with an incrementing reference number and computed display name", () => {
    const first = useSubmissionStore.getState().addSubmission({
      formId: "employee_form",
      formName: "Employee Form",
      responses: { field_1: "Jane Doe", field_2: "jane@test.com" },
      fields: FIELDS,
    });

    expect(first.referenceNumber).toBe("FORM-000001");
    expect(first.displayName).toBe("Jane Doe");
    expect(first.formId).toBe("employee_form");

    const second = useSubmissionStore.getState().addSubmission({
      formId: "employee_form",
      formName: "Employee Form",
      responses: { field_1: "", field_2: "" },
      fields: FIELDS,
    });

    expect(second.referenceNumber).toBe("FORM-000002");
    expect(second.displayName).toBe("Anonymous");
  });

  it("prepends new submissions so the most recent is first", () => {
    const first = useSubmissionStore
      .getState()
      .addSubmission({ formId: "f", formName: "F", responses: {}, fields: [] });
    const second = useSubmissionStore
      .getState()
      .addSubmission({ formId: "f", formName: "F", responses: {}, fields: [] });

    const { submissions } = useSubmissionStore.getState();
    expect(submissions).toHaveLength(2);
    expect(submissions[0].id).toBe(second.id);
    expect(submissions[1].id).toBe(first.id);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test -- submissionStore`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement it**

Create `workflow-form-builder/src/store/submissionStore.js`:

```js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatReferenceNumber, extractDisplayName } from "./submissionHelpers";

export const useSubmissionStore = create(
  persist(
    (set, get) => ({
      submissions: [],
      nextRefNumber: 1,

      addSubmission: ({ formId, formName, responses, fields }) => {
        const { nextRefNumber } = get();
        const record = {
          id: `submission_${nextRefNumber}`,
          formId,
          formName,
          displayName: extractDisplayName(responses, fields),
          submittedAt: new Date().toISOString(),
          responses,
          referenceNumber: formatReferenceNumber(nextRefNumber),
        };

        set((state) => ({
          submissions: [record, ...state.submissions],
          nextRefNumber: state.nextRefNumber + 1,
        }));

        return record;
      },
    }),
    { name: "form-submissions" }
  )
);
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm run test -- submissionStore`
Expected: `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/store/submissionStore.js src/store/submissionStore.test.js
git commit -m "feat: add persisted submission store"
```

---

### Task 9: Form templates

**Files:**
- Create: `workflow-form-builder/src/schemas/templates.js`
- Test: `workflow-form-builder/src/schemas/templates.test.js`

**Interfaces:**
- Produces: `templates` — an array of `{ key, name, description, formName, formDescription, createdBy, version, sections, fields }` objects, directly compatible with `formStore.js`'s existing `loadSchema(data)` action. Consumed by `TemplatePickerModal` (Task 15).

- [ ] **Step 1: Write the failing test**

Create `workflow-form-builder/src/schemas/templates.test.js`:

```js
import { describe, it, expect } from "vitest";
import { templates } from "./templates";

describe("templates", () => {
  it("exposes exactly the three Week 5 templates in order", () => {
    expect(templates.map((t) => t.key)).toEqual([
      "employee_registration",
      "leave_request",
      "customer_feedback",
    ]);
  });

  it("gives every template a name, description, and at least one field", () => {
    templates.forEach((template) => {
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(Array.isArray(template.fields)).toBe(true);
      expect(template.fields.length).toBeGreaterThan(0);
    });
  });

  it("splits the leave request template across two sections, all fields assigned", () => {
    const leaveRequest = templates.find((t) => t.key === "leave_request");
    expect(leaveRequest.sections).toHaveLength(2);
    const sectionIds = new Set(leaveRequest.sections.map((s) => s.id));
    leaveRequest.fields.forEach((field) => {
      expect(sectionIds.has(field.sectionId)).toBe(true);
    });
  });

  it("gives every field a unique id within its own template", () => {
    templates.forEach((template) => {
      const ids = template.fields.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test -- templates`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement it**

Create `workflow-form-builder/src/schemas/templates.js`:

```js
export const templates = [
  {
    key: "employee_registration",
    name: "Employee Registration",
    description: "Collect name, email, and department for a new hire.",
    formName: "Employee Registration",
    formDescription: "Please provide your details to complete registration.",
    createdBy: "",
    version: "1.0",
    sections: [],
    fields: [
      {
        id: "field_1",
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        minLength: 3,
        maxLength: 50,
        defaultValue: "",
        helpText: "",
      },
      {
        id: "field_2",
        type: "email",
        label: "Email",
        placeholder: "name@company.com",
        required: true,
        defaultValue: "",
        helpText: "",
      },
      {
        id: "field_3",
        type: "select",
        label: "Department",
        placeholder: "Select department",
        required: true,
        defaultValue: "",
        helpText: "",
        options: ["Engineering", "Design", "HR", "Finance"],
      },
    ],
  },
  {
    key: "leave_request",
    name: "Leave Request",
    description: "A two-step leave request with type, dates, and reason.",
    formName: "Leave Request",
    formDescription: "Submit a leave request for manager approval.",
    createdBy: "",
    version: "1.0",
    sections: [
      { id: "section_1", name: "Leave Details", fields: [] },
      { id: "section_2", name: "Reason", fields: [] },
    ],
    fields: [
      {
        id: "field_1",
        type: "select",
        label: "Leave Type",
        placeholder: "Select leave type",
        required: true,
        defaultValue: "",
        helpText: "",
        sectionId: "section_1",
        options: ["Sick Leave", "Casual Leave", "Earned Leave"],
      },
      {
        id: "field_2",
        type: "date",
        label: "Start Date",
        placeholder: "",
        required: true,
        defaultValue: "",
        helpText: "",
        sectionId: "section_1",
      },
      {
        id: "field_3",
        type: "date",
        label: "End Date",
        placeholder: "",
        required: true,
        defaultValue: "",
        helpText: "",
        sectionId: "section_1",
      },
      {
        id: "field_4",
        type: "textarea",
        label: "Reason",
        placeholder: "Briefly explain your reason for leave",
        required: true,
        minLength: 10,
        defaultValue: "",
        helpText: "",
        sectionId: "section_2",
      },
    ],
  },
  {
    key: "customer_feedback",
    name: "Customer Feedback",
    description: "A short rating and comments survey.",
    formName: "Customer Feedback",
    formDescription: "We'd love to hear what you think.",
    createdBy: "",
    version: "1.0",
    sections: [],
    fields: [
      {
        id: "field_1",
        type: "select",
        label: "Rating",
        placeholder: "Select a rating",
        required: true,
        defaultValue: "",
        helpText: "",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        id: "field_2",
        type: "textarea",
        label: "Comments",
        placeholder: "Tell us more",
        required: false,
        defaultValue: "",
        helpText: "",
      },
    ],
  },
];
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm run test -- templates`
Expected: `4 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/schemas/templates.js src/schemas/templates.test.js
git commit -m "feat: add Employee Registration, Leave Request, and Customer Feedback templates"
```

---

### Task 10: `DynamicField` + field components — error display and new `onChange` contract

**Files:**
- Modify: `workflow-form-builder/src/renderer/DynamicField.jsx`
- Modify: `workflow-form-builder/src/renderer/fields/TextField.jsx`
- Modify: `workflow-form-builder/src/renderer/fields/TextareaField.jsx`
- Modify: `workflow-form-builder/src/renderer/fields/SelectField.jsx`
- Modify: `workflow-form-builder/src/renderer/fields/CheckboxField.jsx`
- Modify: `workflow-form-builder/src/renderer/fields/RadioField.jsx`
- Test: `workflow-form-builder/src/renderer/DynamicField.test.jsx`

**Interfaces:**
- Produces: `<DynamicField field value onChange error disabled />` where `onChange(newValue)` is called with the **raw new value directly** (no more `(id, value)` wrapping — the old contract was designed for the pre-RHF `FormRenderer`; the new `FormRenderer`, Task 11, binds this directly to RHF's `Controller` field object). `error` is an optional message string rendered beneath the field.

- [ ] **Step 1: Write the failing test**

Create `workflow-form-builder/src/renderer/DynamicField.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DynamicField from "./DynamicField";

const textField = {
  id: "field_1",
  type: "text",
  label: "Full Name",
  placeholder: "Enter name",
  required: true,
};

describe("DynamicField", () => {
  it("renders the field's error message", () => {
    render(
      <DynamicField field={textField} value="" onChange={() => {}} error="Full Name is required" />
    );
    expect(screen.getByText("Full Name is required")).toBeInTheDocument();
  });

  it("calls onChange with the raw new value, no field-id wrapping", () => {
    const handleChange = vi.fn();
    render(<DynamicField field={textField} value="" onChange={handleChange} />);
    fireEvent.change(screen.getByPlaceholderText("Enter name"), { target: { value: "Jane" } });
    expect(handleChange).toHaveBeenCalledWith("Jane");
  });

  it("renders checkbox fields with error text and a boolean onChange", () => {
    const handleChange = vi.fn();
    render(
      <DynamicField
        field={{ id: "f2", type: "checkbox", label: "Agree", required: true }}
        value={false}
        onChange={handleChange}
        error="Agree is required"
      />
    );
    expect(screen.getByText("Agree is required")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("renders an error beneath a radio group", () => {
    render(
      <DynamicField
        field={{ id: "f3", type: "radio", label: "Pick one", options: ["A", "B"] }}
        value=""
        onChange={() => {}}
        error="Pick one is required"
      />
    );
    expect(screen.getByText("Pick one is required")).toBeInTheDocument();
  });

  it("shows an unsupported-type message for unknown types", () => {
    render(<DynamicField field={{ id: "x", type: "bogus" }} value="" onChange={() => {}} />);
    expect(screen.getByText(/Unsupported field type/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test -- DynamicField`
Expected: FAIL — error text not found (fields don't accept/render `error` yet), and/or `onChange` called with `("field_1", "Jane")` instead of `("Jane")`.

- [ ] **Step 3: Update `DynamicField.jsx`**

Replace `workflow-form-builder/src/renderer/DynamicField.jsx` in full:

```jsx
// src/renderer/DynamicField.jsx
// Looks up a single field's component in the registry and renders it.
// `onChange` is forwarded as-is (single new-value argument) — the caller
// (FormRenderer, wired to react-hook-form's Controller) already knows which
// field this is via the `name` it registered the Controller under.

import { createElement } from "react";
import { getFieldComponent } from "./fieldRegistry";

export default function DynamicField({ field, value, onChange, error, disabled = false }) {
  const fieldComponent = getFieldComponent(field.type);

  if (!fieldComponent) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
        Unsupported field type: <code>{field.type}</code>
      </div>
    );
  }

  return createElement(fieldComponent, {
    field,
    value,
    disabled,
    error,
    onChange,
  });
}
```

- [ ] **Step 4: Update `TextField.jsx`**

Replace `workflow-form-builder/src/renderer/fields/TextField.jsx` in full:

```jsx
// src/renderer/fields/TextField.jsx
import Input from "../../components/ui/input";

export default function TextField({ field, value, onChange, error, disabled }) {
  return (
    <Input
      label={field.label}
      type={field.type}
      placeholder={field.placeholder}
      helpText={field.helpText}
      required={field.required}
      disabled={disabled}
      error={error}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

- [ ] **Step 5: Update `TextareaField.jsx`**

Replace `workflow-form-builder/src/renderer/fields/TextareaField.jsx` in full:

```jsx
// src/renderer/fields/TextareaField.jsx
import Textarea from "../../components/ui/textarea";

export default function TextareaField({ field, value, onChange, error, disabled }) {
  return (
    <Textarea
      label={field.label}
      placeholder={field.placeholder}
      helpText={field.helpText}
      required={field.required}
      disabled={disabled}
      error={error}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

- [ ] **Step 6: Update `SelectField.jsx`**

Replace `workflow-form-builder/src/renderer/fields/SelectField.jsx` in full:

```jsx
// src/renderer/fields/SelectField.jsx
import Select from "../../components/ui/select";

export default function SelectField({ field, value, onChange, error, disabled }) {
  return (
    <Select
      label={field.label}
      required={field.required}
      disabled={disabled}
      error={error}
      placeholder={field.placeholder || "Select an option"}
      options={field.options || []}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

- [ ] **Step 7: Update `CheckboxField.jsx`**

Replace `workflow-form-builder/src/renderer/fields/CheckboxField.jsx` in full:

```jsx
// src/renderer/fields/CheckboxField.jsx
import Checkbox from "../../components/ui/checkbox";

export default function CheckboxField({ field, value, onChange, error, disabled }) {
  return (
    <div className="space-y-1.5">
      <Checkbox
        id={`field-${field.id}`}
        label={
          <span>
            {field.label}
            {field.required && <span className="ml-0.5 text-red-500">*</span>}
          </span>
        }
        checked={!!value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 8: Update `RadioField.jsx`**

Replace `workflow-form-builder/src/renderer/fields/RadioField.jsx` in full:

```jsx
// src/renderer/fields/RadioField.jsx
import Radio from "../../components/ui/radio";

export default function RadioField({ field, value, onChange, error, disabled }) {
  const options = field.options || [];

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      <div className="flex flex-col gap-2 pt-0.5">
        {options.map((opt, index) => (
          <Radio
            key={`${field.id}-${index}`}
            id={`field-${field.id}-${index}`}
            name={`field-${field.id}`}
            label={opt}
            value={opt}
            checked={value === opt}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
          />
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 9: Run the test and confirm it passes**

Run: `npm run test -- DynamicField`
Expected: `5 passed`.

- [ ] **Step 10: Commit**

```bash
git add src/renderer/DynamicField.jsx src/renderer/DynamicField.test.jsx src/renderer/fields/*.jsx
git commit -m "feat: thread inline error messages through field components"
```

---

### Task 11: `FormRenderer` — react-hook-form, validation, conditional fields, multi-step, review step

This is the core rewrite. It consumes every pure module from Tasks 4–6 and the new `DynamicField` contract from Task 10.

**Files:**
- Modify: `workflow-form-builder/src/renderer/FormRenderer.jsx`
- Test: `workflow-form-builder/src/renderer/FormRenderer.test.jsx`

**Interfaces:**
- Consumes: `getValidationRules(field)` (Task 4), `isFieldVisible(field, values)` (Task 5), `groupFieldsBySection(fields, sections)` (Task 6), `DynamicField` (Task 10).
- Produces: `<FormRenderer schema sections disabled showSubmit submitLabel onSubmit emptyMessage />`. `onSubmit(values)` fires only once every visible, registered field passes validation. `sections` is new — omit or pass `[]` for the existing single-page behavior.

- [ ] **Step 1: Write the failing tests**

Create `workflow-form-builder/src/renderer/FormRenderer.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormRenderer from "./FormRenderer";

const SIMPLE_SCHEMA = [
  {
    id: "field_1",
    type: "text",
    label: "Full Name",
    placeholder: "Enter name",
    required: true,
    minLength: 3,
  },
  {
    id: "field_2",
    type: "email",
    label: "Email",
    placeholder: "name@example.com",
    required: true,
  },
];

describe("FormRenderer — single page validation", () => {
  it("shows validation errors and blocks submit when fields are invalid", async () => {
    const onSubmit = vi.fn();
    render(<FormRenderer schema={SIMPLE_SCHEMA} showSubmit onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Full Name is required")).toBeInTheDocument();
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the captured values once every field is valid", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<FormRenderer schema={SIMPLE_SCHEMA} showSubmit onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText("Enter name"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("name@example.com"), "jane@test.com");
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ field_1: "Jane Doe", field_2: "jane@test.com" })
    );
  });

  it("rejects an invalid email format", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<FormRenderer schema={SIMPLE_SCHEMA} showSubmit onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText("Enter name"), "Jane Doe");
    await user.type(screen.getByPlaceholderText("name@example.com"), "not-an-email");
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

const CONDITIONAL_SCHEMA = [
  {
    id: "field_employed",
    type: "radio",
    label: "Are you employed?",
    options: ["Yes", "No"],
    required: true,
  },
  {
    id: "field_company",
    type: "text",
    label: "Company Name",
    placeholder: "Enter company",
    required: true,
    showIf: { field: "field_employed", value: "Yes" },
  },
];

describe("FormRenderer — conditional fields", () => {
  it("only shows the dependent field once the condition is met", async () => {
    const user = userEvent.setup();
    render(<FormRenderer schema={CONDITIONAL_SCHEMA} showSubmit onSubmit={() => {}} />);

    expect(screen.queryByPlaceholderText("Enter company")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Yes"));

    expect(await screen.findByPlaceholderText("Enter company")).toBeInTheDocument();
  });

  it("drops validation for a field once it becomes hidden again", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<FormRenderer schema={CONDITIONAL_SCHEMA} showSubmit onSubmit={onSubmit} />);

    await user.click(screen.getByLabelText("Yes"));
    expect(await screen.findByPlaceholderText("Enter company")).toBeInTheDocument();

    await user.click(screen.getByLabelText("No"));
    await waitFor(() =>
      expect(screen.queryByPlaceholderText("Enter company")).not.toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ field_employed: "No", field_company: "" })
    );
  });
});

const STEP_SCHEMA = [
  {
    id: "field_name",
    type: "text",
    label: "Full Name",
    placeholder: "Enter name",
    required: true,
    sectionId: "section_1",
  },
  {
    id: "field_dept",
    type: "text",
    label: "Department",
    placeholder: "Enter department",
    required: true,
    sectionId: "section_2",
  },
];

const SECTIONS = [
  { id: "section_1", name: "Personal Information" },
  { id: "section_2", name: "Employment Information" },
];

describe("FormRenderer — multi-step", () => {
  it("blocks Next until the step's required field is filled, then walks to the review step and submits", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <FormRenderer schema={STEP_SCHEMA} sections={SECTIONS} showSubmit onSubmit={onSubmit} />
    );

    expect(screen.getByText("Step 1 of 3 — Personal Information")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Full Name is required")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3 — Personal Information")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Enter name"), "Jane Doe");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Step 2 of 3 — Employment Information")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Enter department"), "Engineering");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Step 3 of 3 — Review & Submit")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ field_name: "Jane Doe", field_dept: "Engineering" })
    );
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm run test -- FormRenderer`
Expected: FAIL — current `FormRenderer` has no validation, no conditional logic, no steps.

- [ ] **Step 3: Implement it**

Replace `workflow-form-builder/src/renderer/FormRenderer.jsx` in full:

```jsx
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
            onChange={(next) => onChange(field.type === "number" && next !== "" ? Number(next) : next)}
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

  return (
    <form onSubmit={handleSubmit(onSubmit || (() => {}))} onKeyDown={handleFormKeyDown} className="space-y-5">
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
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm run test -- FormRenderer`
Expected: `6 passed`.

- [ ] **Step 5: Run the full test suite**

Run: `npm run test`
Expected: all suites green (Tasks 1–11 combined).

- [ ] **Step 6: Commit**

```bash
git add src/renderer/FormRenderer.jsx src/renderer/FormRenderer.test.jsx
git commit -m "feat: rebuild FormRenderer on react-hook-form with conditional fields and multi-step support"
```

---

### Task 12: Property Panel — validation configuration UI

**Files:**
- Modify: `workflow-form-builder/src/components/builder/PropertyPanel.jsx`

**Interfaces:**
- Consumes: `updateField(id, data)` (existing `formStore.js` action) to write `minLength`/`maxLength`/`pattern`/`patternMessage`/`min`/`max` onto the selected field (properties added in Task 3, read by `getValidationRules` in Task 4).

- [ ] **Step 1: Add validation fields to the panel**

In `workflow-form-builder/src/components/builder/PropertyPanel.jsx`, insert the following block immediately after the existing "Required" checkbox block (`{/* Required */}` ... its closing `</div>`) and before the existing `{/* Options (for select/radio) */}` block:

```jsx
      {/* Length validation (text-like fields) */}
      {["text", "textarea", "password", "email"].includes(selectedField.type) && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Length</label>
            <input
              type="number"
              min="0"
              value={selectedField.minLength ?? ""}
              onChange={(e) =>
                handleChange("minLength", e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Length</label>
            <input
              type="number"
              min="0"
              value={selectedField.maxLength ?? ""}
              onChange={(e) =>
                handleChange("maxLength", e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Regex pattern (plain text fields only — email already has built-in format validation) */}
      {["text", "textarea"].includes(selectedField.type) && (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Regex Pattern</label>
            <input
              type="text"
              value={selectedField.pattern ?? ""}
              onChange={(e) => handleChange("pattern", e.target.value)}
              placeholder="e.g. ^[0-9]{10}$"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pattern Error Message
            </label>
            <input
              type="text"
              value={selectedField.patternMessage ?? ""}
              onChange={(e) => handleChange("patternMessage", e.target.value)}
              placeholder="10 digits only"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Numeric range (number fields) */}
      {selectedField.type === "number" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Value</label>
            <input
              type="number"
              value={selectedField.min ?? ""}
              onChange={(e) => handleChange("min", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Value</label>
            <input
              type="number"
              value={selectedField.max ?? ""}
              onChange={(e) => handleChange("max", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, open `http://localhost:5173/form-builder`.
1. Add a Text field, select it. Confirm "Min Length"/"Max Length" inputs appear; set Min Length to 3.
2. Add a Number field, select it. Confirm "Minimum Value"/"Maximum Value" inputs appear (not Min/Max Length).
3. Add a Text field, set a Regex Pattern (`^[0-9]{10}$`) and a Pattern Error Message (`10 digits only`). Confirm both persist after clicking away and reselecting the field.
4. Select an Email field. Confirm no Regex Pattern box is shown (only Min/Max Length).
5. Refresh the page — confirm all values above survived the reload (localStorage persistence).

Expected: all five checks pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/builder/PropertyPanel.jsx
git commit -m "feat: add validation configuration fields to the property panel"
```

---

### Task 13: Conditional field configuration (`ConditionalPanel`)

**Files:**
- Create: `workflow-form-builder/src/components/builder/ConditionalPanel.jsx`
- Modify: `workflow-form-builder/src/components/builder/PropertyPanel.jsx`

**Interfaces:**
- Consumes: `useFormStore` (`fields`, `updateField`) and reads/writes the selected field's `showIf` property (Task 3).
- Produces: a "Show this field only when…" UI section, rendered inside `PropertyPanel`.

- [ ] **Step 1: Create `ConditionalPanel.jsx`**

Create `workflow-form-builder/src/components/builder/ConditionalPanel.jsx`:

```jsx
// src/components/builder/ConditionalPanel.jsx
import { useFormStore } from "../../store/formStore";

function valueOptionsFor(targetField) {
  if (!targetField) return null;
  if (targetField.type === "checkbox") return ["true", "false"];
  if (["select", "radio"].includes(targetField.type)) return targetField.options || [];
  return null; // free text
}

export default function ConditionalPanel({ field }) {
  const fields = useFormStore((s) => s.fields);
  const updateField = useFormStore((s) => s.updateField);

  const otherFields = fields.filter((f) => f.id !== field.id);
  const showIf = field.showIf || null;
  const targetField = showIf ? fields.find((f) => f.id === showIf.field) : null;
  const valueOptions = valueOptionsFor(targetField);

  if (!otherFields.length) return null;

  const handleTargetChange = (targetId) => {
    if (!targetId) {
      updateField(field.id, { showIf: null });
      return;
    }
    updateField(field.id, { showIf: { field: targetId, value: "" } });
  };

  const handleValueChange = (value) => {
    updateField(field.id, { showIf: { field: showIf.field, value } });
  };

  return (
    <div className="pt-4 border-t space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Show this field only when…
      </label>
      <select
        value={showIf?.field || ""}
        onChange={(e) => handleTargetChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Always show</option>
        {otherFields.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>

      {showIf &&
        (valueOptions ? (
          <select
            value={showIf.value}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select expected value</option>
            {valueOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={showIf.value}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Expected value"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
    </div>
  );
}
```

- [ ] **Step 2: Wire it into `PropertyPanel.jsx`**

In `workflow-form-builder/src/components/builder/PropertyPanel.jsx`, add the import at the top:

```jsx
import ConditionalPanel from "./ConditionalPanel";
```

Then add `<ConditionalPanel field={selectedField} />` as the very last element inside the panel's outermost `<div className="space-y-4">`, after the `{/* Options (for select/radio) */}` block's closing tag.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open `/form-builder`.
1. Add a Radio field labeled "Are you employed?" with options Yes/No.
2. Add a Text field labeled "Company Name". Select it — confirm the "Show this field only when…" dropdown lists "Are you employed?" (and no other fields, since it's the only other field).
3. Pick "Are you employed?" as the target, then pick "Yes" as the expected value (dropdown of that field's options, not a free-text box).
4. Go to `/preview`. Confirm "Company Name" is hidden until you select "Yes" on "Are you employed?", then appears; selecting "No" hides it again.
5. Back in the builder, add a Number field and set a condition target to a Checkbox field — confirm the value picker shows a `true`/`false` dropdown, not free text.

Expected: all five checks pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/builder/ConditionalPanel.jsx src/components/builder/PropertyPanel.jsx
git commit -m "feat: add conditional field visibility configuration to the property panel"
```

---

### Task 14: Multi-step assignment (`StepManagerPanel` + step dropdown)

**Files:**
- Create: `workflow-form-builder/src/components/builder/StepManagerPanel.jsx`
- Modify: `workflow-form-builder/src/components/builder/PropertyPanel.jsx`
- Modify: `workflow-form-builder/src/pages/formbuilder.jsx`

**Interfaces:**
- Consumes: existing `formStore.js` actions `addSection`, `updateSection`, `removeSection`, and state `sections`.
- Produces: a "Steps" manager in the builder's right column, and a per-field "Step" dropdown in `PropertyPanel` that writes `sectionId` (Task 3).

- [ ] **Step 1: Create `StepManagerPanel.jsx`**

Create `workflow-form-builder/src/components/builder/StepManagerPanel.jsx`:

```jsx
// src/components/builder/StepManagerPanel.jsx
import { useState } from "react";
import { useFormStore } from "../../store/formStore";

export default function StepManagerPanel() {
  const sections = useFormStore((s) => s.sections);
  const addSection = useFormStore((s) => s.addSection);
  const updateSection = useFormStore((s) => s.updateSection);
  const removeSection = useFormStore((s) => s.removeSection);
  const [newStepName, setNewStepName] = useState("");

  const handleAdd = () => {
    addSection(newStepName.trim() || `Step ${sections.length + 1}`);
    setNewStepName("");
  };

  return (
    <div className="space-y-3 pb-4 border-b mb-4">
      <h3 className="font-bold text-gray-700">Steps {sections.length > 0 && `(${sections.length})`}</h3>
      <p className="text-xs text-gray-500">
        Add steps to turn this form into a multi-step wizard. Leave empty for a single-page form.
      </p>

      {sections.map((section) => (
        <div key={section.id} className="flex gap-2">
          <input
            type="text"
            value={section.name}
            onChange={(e) => updateSection(section.id, { name: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => removeSection(section.id)}
            className="px-2 py-2 text-gray-500 hover:bg-red-100 rounded transition"
            title="Remove step"
          >
            ❌
          </button>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          type="text"
          value={newStepName}
          onChange={(e) => setNewStepName(e.target.value)}
          placeholder="New step name"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
        >
          + Add Step
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add a step-assignment dropdown to `PropertyPanel.jsx`**

In `workflow-form-builder/src/components/builder/PropertyPanel.jsx`, add `sections` alongside the existing store reads at the top:

```jsx
  const sections = useFormStore((s) => s.sections);
```

Then insert this block right after the "Required" checkbox block (before the validation blocks added in Task 12, or after — order between Task 12/14 blocks doesn't matter functionally):

```jsx
      {/* Step assignment (multi-step forms) */}
      {sections.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Step</label>
          <select
            value={selectedField.sectionId || sections[0].id}
            onChange={(e) => handleChange("sectionId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
```

- [ ] **Step 3: Wire `StepManagerPanel` into `formbuilder.jsx`**

In `workflow-form-builder/src/pages/formbuilder.jsx`, add the import:

```jsx
import StepManagerPanel from "../components/builder/StepManagerPanel";
```

In the "RIGHT — PROPERTY PANEL" column, add `<StepManagerPanel />` immediately before `<FormMetadata />`:

```jsx
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm overflow-y-auto max-h-[680px]">
            <h2 className="mb-4 font-semibold text-gray-900">⚙️ Properties</h2>
            <StepManagerPanel />
            <FormMetadata />
            <PropertyPanel />
          </div>
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open `/form-builder`.
1. Confirm a "Steps" section appears above "Form Settings" in the right column, with an "+ Add Step" control and no steps listed yet.
2. Add two steps: "Personal Information" and "Employment Information".
3. Add two fields (e.g., a Text field and a Select field). Select each and confirm a "Step" dropdown appears in Properties, listing both step names; assign the first field to "Personal Information" and the second to "Employment Information".
4. Go to `/preview`. Confirm the form now renders as a wizard: "Step 1 of 3 — Personal Information", a Next button, then step 2, then a "Review & Submit" step listing both entered values, then a working Submit.
5. Remove both steps back in the builder. Confirm `/preview` reverts to the original single-page form (no step chrome, plain Submit).

Expected: all five checks pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/builder/StepManagerPanel.jsx src/components/builder/PropertyPanel.jsx src/pages/formbuilder.jsx
git commit -m "feat: add multi-step management UI (steps panel + per-field step assignment)"
```

---

### Task 15: Template picker + "Use Template" button (+ fix the dormant "Load Sample" bug)

**Files:**
- Create: `workflow-form-builder/src/components/builder/TemplatePickerModal.jsx`
- Modify: `workflow-form-builder/src/pages/formbuilder.jsx`

**Interfaces:**
- Consumes: `templates` (Task 9), existing `formStore.js` action `loadSchema(data)`, existing `ui/modal.jsx` (`isOpen`, `onClose`, `title`, `children` props).

> **Bundled bug fix:** `formbuilder.jsx`'s existing "Load Sample" button calls `loadSchema(exampleEmployeeForm)`, where `exampleEmployeeForm` is a plain **array** of fields (see `formSchema.js`). `loadSchema` reads `data.fields`, which is `undefined` on a bare array — so today, clicking "Load Sample" silently loads an **empty** form. Fixed in Step 2 below, in the same file this task already touches.

- [ ] **Step 1: Create `TemplatePickerModal.jsx`**

Create `workflow-form-builder/src/components/builder/TemplatePickerModal.jsx`:

```jsx
// src/components/builder/TemplatePickerModal.jsx
import Modal from "../ui/modal";
import Button from "../ui/button";
import { templates } from "../../schemas/templates";

export default function TemplatePickerModal({ isOpen, onClose, onSelect }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose a Template">
      <div className="space-y-3">
        {templates.map((template) => (
          <div key={template.key} className="rounded-lg border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-900">{template.name}</h4>
            <p className="mt-1 text-sm text-gray-600">{template.description}</p>
            <Button
              size="sm"
              className="mt-3"
              onClick={() => {
                onSelect(template);
                onClose();
              }}
            >
              Create From Template
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Wire it into `formbuilder.jsx` and fix the "Load Sample" bug**

In `workflow-form-builder/src/pages/formbuilder.jsx`:

Add imports:

```jsx
import { useState } from "react";
import TemplatePickerModal from "../components/builder/TemplatePickerModal";
```

Add state inside the `FormBuilder` component, alongside the existing store hooks:

```jsx
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
```

Replace the existing "Load Sample" button (currently `onClick={() => loadSchema(exampleEmployeeForm)}`) with the fixed call, and add a "Use Template" button next to it:

```jsx
            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadSchema({ fields: exampleEmployeeForm })}
            >
              Load Sample
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setTemplateModalOpen(true)}>
              Use Template
            </Button>
```

Add the modal at the end of the component's JSX, just before the closing `</DndContext>`:

```jsx
      <TemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelect={(template) => loadSchema(template)}
      />
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open `/form-builder`.
1. Click "Load Sample" — confirm it now actually loads the 4-field employee sample (name/email/department/start date), not an empty canvas. (This confirms the bug fix.)
2. Click "Reset", then click "Use Template" — confirm a modal opens listing Employee Registration, Leave Request, and Customer Feedback, each with a description and a "Create From Template" button.
3. Click "Create From Template" on Leave Request — confirm the modal closes and the canvas now shows 4 fields, and the "Steps" panel (Task 14) shows 2 steps ("Leave Details", "Reason").
4. Go to `/preview` — confirm the Leave Request template renders as a working 2-step wizard with a review step.
5. Go back, click "Use Template" again, pick Customer Feedback — confirm it loads Rating + Comments with no steps (single page).

Expected: all five checks pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/builder/TemplatePickerModal.jsx src/pages/formbuilder.jsx
git commit -m "feat: add template picker and fix Load Sample loading an empty form"
```

---

### Task 16: Preview page — real submit flow + Thank You screen

**Files:**
- Modify: `workflow-form-builder/src/pages/preview.jsx`

**Interfaces:**
- Consumes: `FormRenderer` (Task 11, now accepting `sections`), `useSubmissionStore().addSubmission` (Task 8), `slugify` (Task 2).

- [ ] **Step 1: Replace `preview.jsx` in full**

Replace `workflow-form-builder/src/pages/preview.jsx` in full:

```jsx
// src/pages/preview.jsx
// Route: /preview
// Renders the final, interactive form via FormRenderer (react-hook-form-backed,
// validation + conditional fields + multi-step aware). On successful submit,
// records the response in the submission store and shows a Thank You screen.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useFormStore } from "../store/formStore";
import { useSubmissionStore } from "../store/submissionStore";
import { slugify } from "../utils/slugify";
import FormRenderer from "../renderer/FormRenderer";
import JSONViewer from "../components/viewer/JSONViewer";
import Button from "../components/ui/button";

function Preview() {
  const fields = useFormStore((s) => s.fields);
  const sections = useFormStore((s) => s.sections);
  const formName = useFormStore((s) => s.formName);
  const formDescription = useFormStore((s) => s.formDescription);
  const createdBy = useFormStore((s) => s.createdBy);
  const version = useFormStore((s) => s.version);
  const addSubmission = useSubmissionStore((s) => s.addSubmission);
  const [submittedRecord, setSubmittedRecord] = useState(null);

  const schemaData = { formName, formDescription, createdBy, version, fields, sections };

  const handleSubmit = (values) => {
    const record = addSubmission({
      formId: slugify(formName),
      formName: formName || "Untitled Form",
      responses: values,
      fields,
    });
    setSubmittedRecord(record);
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
    </div>
  );
}

export default Preview;
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, open `/form-builder`, click "Load Sample", then open `/preview`.
1. Leave "Full Name" empty and click Submit — confirm an inline "is required"-style error appears and the form does not advance to the Thank You screen.
2. Fill in valid values for all fields and submit — confirm the form is replaced by a "Thank You" screen showing a `FORM-000001`-style reference number.
3. Click "Submit Another Response" — confirm the form reappears, empty, ready for a new submission.
4. Submit it again — confirm the new reference number increments (`FORM-000002`).
5. Click "View Submissions" from the Thank You screen — confirm it navigates to `/submissions` (page content itself lands in Task 17).

Expected: all five checks pass.

- [ ] **Step 3: Commit**

```bash
git add src/pages/preview.jsx
git commit -m "feat: wire preview page to the submission store and add a Thank You screen"
```

---

### Task 17: Submissions page — real data, search, filter, detail view

**Files:**
- Create: `workflow-form-builder/src/components/submissions/SubmissionDetailModal.jsx`
- Modify: `workflow-form-builder/src/pages/submissions.jsx`

**Interfaces:**
- Consumes: `useSubmissionStore` (Task 8), `filterSubmissions` (Task 7), `ui/modal.jsx`.

- [ ] **Step 1: Create `SubmissionDetailModal.jsx`**

Create `workflow-form-builder/src/components/submissions/SubmissionDetailModal.jsx`:

```jsx
// src/components/submissions/SubmissionDetailModal.jsx
import Modal from "../ui/modal";

export default function SubmissionDetailModal({ submission, onClose }) {
  return (
    <Modal isOpen={!!submission} onClose={onClose} title="Submission Details">
      {submission && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Reference Number:{" "}
            <span className="font-mono font-semibold text-gray-900">
              {submission.referenceNumber}
            </span>
          </p>
          <p className="text-xs text-gray-500">
            Submitted {new Date(submission.submittedAt).toLocaleString()}
          </p>
          <div className="space-y-2 pt-2 border-t">
            {Object.entries(submission.responses).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 text-sm">
                <span className="font-medium text-gray-600">{key}</span>
                <span className="text-gray-900">
                  {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "—")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
```

- [ ] **Step 2: Replace `submissions.jsx` in full**

Replace `workflow-form-builder/src/pages/submissions.jsx` in full:

```jsx
// src/pages/submissions.jsx
// Route: /submissions
// Real submission history: search by name/form, filter by date, view full details.

import { useMemo, useState } from "react";
import { useSubmissionStore } from "../store/submissionStore";
import { filterSubmissions } from "../store/submissionHelpers";
import SubmissionDetailModal from "../components/submissions/SubmissionDetailModal";

const DATE_FILTERS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
];

function Submissions() {
  const submissions = useSubmissionStore((s) => s.submissions);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const visible = useMemo(
    () => filterSubmissions(submissions, { search, dateFilter }),
    [submissions, search, dateFilter]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
      <p className="mt-2 text-gray-600">View submitted forms and their responses.</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or form…"
          className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        />
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        >
          {DATE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
            <span className="mb-2 text-3xl">📭</span>
            <p className="font-medium">No submissions yet</p>
          </div>
        ) : (
          visible.map((submission) => (
            <div
              key={submission.id}
              className="flex items-center justify-between border-b border-gray-100 p-4 last:border-b-0"
            >
              <div>
                <p className="font-medium text-gray-800">{submission.displayName}</p>
                <p className="text-sm text-gray-500">
                  {submission.formName} · {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelected(submission)}
                className="text-sm font-medium text-violet-600 hover:underline"
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      <SubmissionDetailModal submission={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default Submissions;
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`. From `/preview`, submit the sample form 2–3 times with different names/emails. Then open `/submissions`.
1. Confirm each submission appears as a row with the respondent's name and a submitted date/time, most recent first.
2. Type part of a submitted name into the search box — confirm the list filters to matching rows only.
3. Clear the search, switch the date filter to "Today" — confirm all your just-created submissions still show (they're from today).
4. Click "View Details" on a row — confirm a modal opens showing the reference number and every field label/value from that submission.
5. Close the modal, refresh the page — confirm all submissions are still listed (localStorage persistence).

Expected: all five checks pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/submissions/SubmissionDetailModal.jsx src/pages/submissions.jsx
git commit -m "feat: replace static submissions page with real search/filter/detail view"
```

---

### Task 18: Documentation

**Files:**
- Create: `workflow-form-builder/WEEK5-IMPLEMENTATION.md`
- Modify: `workflow-form-builder/README.md`

- [ ] **Step 1: Write `WEEK5-IMPLEMENTATION.md`**

Create `workflow-form-builder/WEEK5-IMPLEMENTATION.md`:

```markdown
# Week 5 Implementation Summary — Form Engine

## 1. Why Validation Matters

A form with no validation silently accepts garbage: empty required answers, malformed
emails, out-of-range numbers. That pushes the cost of catching bad data downstream —
onto whoever has to read the responses — instead of catching it at the moment the
person filling out the form can still fix it. Client-side validation also gives
immediate feedback (no round trip needed) and reduces frustration versus a form that
only reports "something went wrong" after submission.

## 2. Validation Types Implemented

| Type | Config | Example message |
| --- | --- | --- |
| Required | `required: true` | "Full Name is required" |
| Minimum length | `minLength: 3` | "Minimum 3 characters" |
| Maximum length | `maxLength: 50` | "Maximum 50 characters" |
| Email format | `type: "email"` (automatic) | "Invalid email address" |
| Numeric range | `min` / `max` on a Number field | "Minimum: 1" / "Maximum: 100" |
| Regex pattern | `pattern` + `patternMessage` | e.g. "10 digits only" |

All rules are generated from the flat field schema by
`src/validation/buildValidationRules.js` and fed to `react-hook-form` as per-field
rules via `<Controller rules={...}>`. Validation runs on blur, revalidates live once
a field has been touched, and always re-runs in full on submit.

## 3. Examples From Popular Form Systems

- **Google Forms** — per-question "Required" toggle, plus response-type validation
  (number range, text length, regex) configurable per question; shows inline errors
  beneath the offending question on submit.
- **Microsoft Forms** — similar per-question required/format rules; also supports
  branching ("Go to section based on answer"), which this app's `showIf` conditional
  fields and multi-step sections mirror.
- **Typeform** — one question per screen (informed the multi-step wizard design
  here), with logic jumps that skip/show later questions based on earlier answers —
  the direct inspiration for `showIf`.

## 4. Architecture Notes

- **Validation engine**: `src/validation/buildValidationRules.js` — pure function,
  schema in, react-hook-form rules out. Unit tested in isolation.
- **React Hook Form integration**: `src/renderer/FormRenderer.jsx` uses `useForm()`
  (`handleSubmit`, `formState.errors`, `watch`, `trigger`, `getValues`) with
  `Controller` wrapping each schema-driven field component (the field components are
  plain prop-driven wrappers, not `forwardRef` inputs, so `Controller` — not
  `register()` — is the correct integration point).
- **Conditional fields**: a field's `showIf: { field, value }` is evaluated against
  `watch()`'s live values via `src/renderer/conditionalVisibility.js`. Hidden fields
  are unregistered (value kept, rules dropped) so a hidden required field can never
  block submission.
- **Multi-step forms**: reuse the `sections` array already scaffolded in
  `formStore.js`. `src/renderer/formSteps.js` groups fields by `sectionId`.
  `FormRenderer` renders Previous/Next + a "Step X of N" progress bar, and always
  appends one extra **Review & Submit** step summarizing every answer before the
  real submit button. Forms with no sections render exactly as they always have —
  single page, no wizard chrome.
- **Submission storage**: `src/store/submissionStore.js` (a separate persisted
  Zustand store from the builder's own `formStore.js`, so submission history
  survives a form reset/edit) records `{ id, formId, formName, displayName,
  submittedAt, responses, referenceNumber }` on every successful preview submit.
  `formId` is a slug of the form's name (`src/utils/slugify.js`).
- **Template loading**: `src/schemas/templates.js` exports full `loadSchema()`-ready
  bundles (fields + sections + metadata) for Employee Registration, Leave Request
  (a live 2-step demo), and Customer Feedback. `TemplatePickerModal` calls the
  existing `loadSchema()` store action — no new persistence mechanism.

## 5. Testing Strategy

Pure logic (validation rules, conditional visibility, step grouping, submission
helpers, the submission store itself) has Vitest unit tests. `FormRenderer` — the
piece where validation, conditional fields, and multi-step interact — has
Testing-Library tests covering required/format validation, conditional show/hide
(including that a field's validation is dropped once it's hidden again), and the
full multi-step-to-review-to-submit flow. Page-level wiring (property panel
controls, the template picker, the submissions page) is thin glue over already-
tested logic and was verified manually in the browser.

Run `npm run test` for the automated suite.

## 6. Screenshots Checklist

See the "Screenshots Required" section of `docs/superpowers/specs/2026-07-04-week5-form-engine-design.md`'s
source PDF, reproduced here for convenience:

- **Form Builder** — validation settings in the property panel.
- **Preview Page** — an inline error message; multi-step navigation.
- **Submission Page** — the response list; a single response's detail view.
- **Conditional Fields** — before the condition is met; after.

## 7. Demo Session Prep

1. **Validation architecture** — walk through `buildValidationRules.js` and how a
   field's flat schema properties become RHF rules.
2. **React Hook Form integration** — `useForm`, `Controller`, `formState.errors`,
   `watch()` doing double duty for live errors and conditional visibility.
3. **Conditional rendering logic** — `showIf` + `isFieldVisible` + the
   unregister-on-hide fix.
4. **Multi-step form implementation** — `sections` reuse, `groupFieldsBySection`,
   the auto-appended review step.
5. **Submission storage structure** — the `submissionStore.js` shape and why it's a
   separate store from the builder schema.
6. **Template loading mechanism** — `templates.js` bundles feeding the existing
   `loadSchema()` action.
```

- [ ] **Step 2: Update `README.md`**

In `workflow-form-builder/README.md`, add a new section after the existing "## Week 4 Features — Drag-and-Drop & Advanced Form Design" section (before "## Routes"):

```markdown
## Week 5 Features — Validation, Submission & Multi-Step Engine

### Dynamic Validation
- Schema-driven validation engine (`src/validation/buildValidationRules.js`)
  generates react-hook-form rules from each field's flat schema properties:
  required, min/max length, numeric range, email format, and custom regex.
- `FormRenderer` is now built on `react-hook-form` (`useForm` + `Controller`),
  with inline error messages rendered beneath each field.

### Conditional Fields
- Any field can declare `showIf: { field, value }` to only appear when another
  field's live value matches. Configurable per field in the Property Panel.

### Multi-Step Forms
- Forms can be split into steps by reusing the builder's existing section
  concept — assign each field to a step in the Property Panel. Multi-step forms
  get Previous/Next navigation, a progress indicator, and an automatic
  Review & Submit step.

### Form Templates
- Three ready-made templates (Employee Registration, Leave Request, Customer
  Feedback) loadable from the Form Builder's "Use Template" button.

### Submission Storage & Management
- Every `/preview` submission is recorded (separate `submissionStore.js`,
  localStorage-backed) with a generated reference number.
- `/submissions` now shows real data: search by name/form, filter by date, and
  view full response details per submission.

See `WEEK5-IMPLEMENTATION.md` for the full write-up (validation research,
architecture notes, testing strategy, and the demo/screenshot checklist).
```

- [ ] **Step 3: Commit**

```bash
git add WEEK5-IMPLEMENTATION.md README.md
git commit -m "docs: add Week 5 implementation summary and README updates"
```

---

### Task 19: Final regression pass

**Files:** none (verification only).

- [ ] **Step 1: Automated checks**

Run, from `workflow-form-builder/`:

```bash
npm run test
npm run lint
npm run build
```

Expected: all three succeed with no failing tests, no lint errors, and a successful production build.

- [ ] **Step 2: Full manual click-through**

Run `npm run dev` and walk the entire flow end to end:
1. `/form-builder`: add a Text (required, min length 3), Email (required), Number (min 1 / max 100), Radio ("Are you employed?" Yes/No), and a conditional Text field ("Company Name", shown only when "Yes"). Add two steps and assign fields across them. Save a screenshot of the Property Panel showing validation settings for the Text field.
2. `/preview`: trigger and screenshot an inline validation error; screenshot the multi-step progress indicator mid-flow; submit successfully and confirm the Thank You screen with a reference number.
3. `/submissions`: screenshot the response list; open "View Details" and screenshot the single-response view.
4. Back in `/form-builder`: toggle the conditional field's trigger from "No" to "Yes" in `/preview` and screenshot both the "before" (hidden) and "after" (visible) states.
5. Click "Use Template", load each of the three templates, and confirm each renders correctly in `/preview` (Leave Request as a 2-step wizard, the others single-page).

Expected: every step above works with no console errors.

- [ ] **Step 3: Commit** (only if Step 1/2 surfaced fixes)

```bash
git add -A
git commit -m "fix: address issues found in Week 5 regression pass"
```

(Skip this commit if no changes were needed.)
