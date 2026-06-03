# Week 2 — Demo Session Notes

Talking points for the demo. Each section maps to the evaluation criteria.

## 1. Component architecture (Reusable Components — 30%)

- All reusable UI lives in **`src/components/ui/`** — one file per component
  (`button`, `input`, `textarea`, `select`, `checkbox`, `radio`, `card`,
  `modal`, `badge`, `toast`).
- Layout/structure components (`sidebar`, `header`, `MainLayout`) are kept
  separate from the reusable library, so the library is portable.
- Pages (`src/pages/`) **compose** these primitives instead of writing raw
  HTML — e.g. the Form Builder property panel is built from `Input`, `Select`,
  `Checkbox`, `Button`.

## 2. Reusable props approach (Props & composition)

- Each component is driven entirely by **props**, not hard-coded values:
  - `Button` → `variant` (primary/secondary/danger/outline), `size`
    (sm/md/lg), `disabled`, `fullWidth`.
  - `Input` → `label`, `type`, `placeholder`, `error`, `disabled`, `required`.
  - `Select` → `options` (accepts strings **or** `{label, value}`),
    `placeholder`, `error`.
  - `Modal` → controlled with `isOpen` / `onClose`, plus `title`, `children`
    (content slot) and a `footer` slot.
- **Prop spreading (`...rest`)** forwards native attributes (`onChange`,
  `name`, `value`) so wrappers stay flexible.
- **State vs props**: the Form Builder owns the field list in `useState`;
  the reusable inputs receive their value via props (they don't own it).
  A `useRef` counter generates stable field IDs (no impure `Date.now()` in
  render).

## 3. Tailwind styling decisions (UI Consistency — 10%)

- Tailwind 4 via `@tailwindcss/vite` (no config file needed).
- A single accent color (**violet-600**) is reused across buttons, active nav,
  and focus rings for visual consistency.
- Variant/size maps are plain objects (`variants[variant]`,
  `sizes[size]`) — easy to read and extend.
- Consistent radius (`rounded-lg`/`rounded-xl`), `shadow-sm`, and spacing
  scale across cards and panels.

## 4. Responsive design implementation (Responsiveness — 15%)

- **Desktop**: sidebar (`md:static`) sits beside main content.
- **Mobile**: sidebar is `fixed` and slides in/out with a translate
  transition; opened via the header **hamburger (☰)**, closed by a dark
  overlay tap.
- Form Builder grid: `grid-cols-1` on mobile → `lg:grid-cols-4`
  (palette / canvas spanning 2 / property panel) on desktop.
- Showcase grids collapse from `sm:grid-cols-2` to single column.

## 5. Form Builder layout structure (Form Builder Layout — 25%)

Route **`/form-builder`**, three columns:
- **Left — Field Palette**: 8 field types (Text Input, Email, Number,
  Dropdown, Checkbox, Radio, Textarea, Date), each a clickable card/button.
- **Center — Builder Canvas**: dashed drop area with an **empty state**
  ("Drop form fields here") and a **scrollable** list once fields are added.
- **Right — Property Panel**: edits the selected field's Label, Placeholder,
  Validation, Required toggle (built from the reusable inputs).

## Quick verification to mention
- `npm run build` → passes (production build clean).
- `npm run lint` → 0 errors.
