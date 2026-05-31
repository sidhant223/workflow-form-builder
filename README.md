# Workflow Form Builder

A React-based frontend prototype for a **Workflow & Dynamic Form Builder** application.
This repository contains the Week 1 dashboard plus the **Week 2 reusable UI
component library** and the **Form Builder page layout**.

## Project Overview

The app lets users manage dynamic forms and workflow stages through a responsive
dashboard. Week 2 adds a library of reusable, prop-driven UI components and the
three-panel Form Builder screen (field palette, builder canvas, property panel).

## Tech Stack

- **React 19** (Vite)
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **React Router 7**
- **Recharts** (dashboard chart)

## Week 2 Features

### Reusable UI component library (`src/components/ui/`)
- **Button** — `primary` / `secondary` / `danger` / `outline` variants, `sm`/`md`/`lg`
  sizes, hover effects, disabled state, full-width option, prop spreading.
- **Input** — text / number / email / password, with label, placeholder, error
  message and disabled support.
- **Textarea** — same API as Input with a configurable `rows`.
- **Select** — label, placeholder, dynamic options (strings or `{label, value}`),
  error and disabled states.
- **Checkbox** & **Radio** — controlled (`checked` / `onChange`), labelled,
  disabled support; group radios with a shared `name`.
- **Card** — padded, rounded, shadowed container with optional `title`.
- **Modal** — controlled (`isOpen` / `onClose`), overlay, Escape-to-close,
  title, content slot and optional footer.
- **Badge** — `success` / `warning` / `error` / `neutral` status variants.
- **Toast** — `success` / `error` / `info` / `warning`, auto-dismiss + manual close.

### Pages
- **Form Builder** (`/form-builder`) — 3-column layout: field palette, builder
  canvas (with empty state + scroll), property panel built from reusable inputs.
- **Components** (`/components`) — live, interactive showcase of every component.
- Improved **Sidebar** (active-route highlighting, icons) and **Header**
  (dynamic page title, notification icon, profile dropdown).
- Fully responsive (sidebar collapses to a hamburger drawer on mobile).

## Routes

| Route           | Page              |
| --------------- | ----------------- |
| `/dashboard`    | Dashboard         |
| `/form-builder` | Form Builder      |
| `/workflow`     | Workflow          |
| `/preview`      | Preview           |
| `/submissions`  | Submissions       |
| `/components`   | Component Showcase|

## Getting Started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# production build
npm run build

# lint
npm run lint
```

## Screenshots

> Add screenshots here for submission:
> - Components page (buttons, inputs, dropdowns)
> - Form Builder page (left palette, center canvas, right property panel)
> - Responsive mobile view (collapsed sidebar / hamburger)

| Components Page | Form Builder | Mobile View |
| --------------- | ------------ | ----------- |
| _screenshot_    | _screenshot_ | _screenshot_|

## Project Structure

```
src/
├── components/
│   ├── header.jsx
│   ├── sidebar.jsx
│   └── ui/            # reusable component library
│       ├── badge.jsx
│       ├── button.jsx
│       ├── card.jsx
│       ├── checkbox.jsx
│       ├── input.jsx
│       ├── modal.jsx
│       ├── radio.jsx
│       ├── select.jsx
│       ├── textarea.jsx
│       └── toast.jsx
├── layouts/
│   └── MainLayout.jsx
├── pages/
│   ├── components.jsx
│   ├── dashboard.jsx
│   ├── formbuilder.jsx
│   ├── preview.jsx
│   ├── submissions.jsx
│   └── workflow.jsx
└── App.jsx
```

See [`NOTES.md`](./NOTES.md) for the reusable-component design write-up.
