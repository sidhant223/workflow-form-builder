# User Guide — FormFlow (Workflow & Dynamic Form Builder)

Welcome to FormFlow. This guide walks through everything you can do in the
app as an end user — no technical background required. Every section below
includes a screenshot placeholder; since this guide was written without a
live browser session, replace each placeholder with a real screenshot when
you have one.

---

## 1. Login

Open the app and you'll land on the **Login** page. Sign in with your email
and password.

FormFlow currently ships with three demo accounts, all sharing the same
password. Both the accounts and the password are shown directly on the
login page itself, so you never have to remember them:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@test.com` | `password123` |
| Manager | `manager@test.com` | `password123` |
| Employee | `employee@test.com` | `password123` |

Type an email and password into the two fields and click **Login**. If the
combination doesn't match one of the accounts above, a red error message
appears above the button and you can try again. On success, you're taken to
the **Dashboard** (or, if you had tried to open a different page while
signed out, back to that exact page).

What you can do in the app — which pages you see in the sidebar, and which
buttons appear on a given screen — depends on which of the three roles you
signed in as. The rest of this guide notes where that matters.

> 📸 Screenshot: Login page, showing the demo account list

---

## 2. Dashboard

After signing in, the **Dashboard** is your home screen. It gives you a
live, at-a-glance summary of everything happening across every form and
workflow — nothing on this page is fixed sample data; it's all computed
from the actual submissions that exist right now.

**KPI cards** (the four boxes across the top):

- **Pending Reviews** — how many submissions are still sitting in some
  in-progress stage of their workflow (i.e. haven't yet reached a final
  Approved or Rejected stage).
- **Approved Today** — how many submissions were approved specifically
  today (based on the date of their most recent "Approved" entry).
- **Rejected** — how many submissions have been rejected, in total.
- **Draft Forms** — how many submissions are still sitting in a "Draft"
  stage (created but not yet formally submitted into review).

**Charts:**

- **Forms by Status** (bar chart) — how many submissions currently sit in
  each workflow stage (Draft, Submitted, Manager Review, Approved,
  Rejected, or "No Workflow" for forms that aren't attached to one).
- **Workflow Distribution** (pie chart) — how submissions are spread across
  the different workflows in use (e.g. how many belong to "Leave Approval"
  versus any other workflow you've created).

Below the charts, **Recent Submissions** lists the five most recently
submitted forms, each with its current status badge, so you can jump
straight into reviewing something new. Click **View All** to go to the
full Submissions list.

> 📸 Screenshot: Dashboard, showing KPI cards and both charts with data

---

## 3. Creating Forms

Only Admins can create and edit forms (Managers and Employees can view and
fill them out, but won't see the New/Edit/Delete controls). To build a new
form, go to **Form Builder** — either from the sidebar, or by clicking
**+ New Form** on the **Forms** page.

The builder is a three-column workspace:

1. **Field Palette (left)** — every available field type (Text Input,
   Email, Number, Password, Textarea, Dropdown, Checkbox, Radio, Date),
   each with an icon. **Drag** a field type from here onto the canvas in
   the middle to add it to your form.
2. **Canvas (center)** — shows every field you've added, in order. Drag a
   field card up or down within the canvas to reorder it. Click a field
   card to select it and open its settings in the panel on the right; each
   card also has quick **Duplicate** and **Delete** buttons.
3. **Property Panel (right)** — three stacked panels:
   - **Steps** — add named steps (e.g. "Leave Details," "Reason") to turn
     the form into a multi-step wizard; leave this empty for a simple
     single-page form.
   - **Form Settings** — the form's name, description, author, version
     number, and — importantly — a **Workflow** dropdown to attach an
     approval workflow to this form (see Section 4).
   - **Field Properties** — once you've selected a field on the canvas,
     configure its **label**, **placeholder** text, **default value**,
     **help text** (extra instructions shown under the field), and whether
     it's **required**. Depending on the field type you'll also see
     length/format/range validation options (minimum/maximum length,
     a regex pattern, or a numeric min/max), a **Step** dropdown (if you've
     added steps) to assign the field to one, an **Options** list editor
     (for Dropdown/Radio fields), and a **"Show this field only when…"**
     conditional-visibility setting that hides the field unless another
     field on the form has a specific value.

You can also click **Use Template** to start from one of three ready-made
forms (Employee Registration, Leave Request, Customer Feedback) instead of
building from scratch, or **Load Sample** to load a small demo form.

When you're happy with the form, use the buttons in the top-right corner:

- **Save** — stores the form with **Draft** status.
- **Publish** — stores the form with **Published** status, making it
  available for everyone to fill out from the Forms page.

Both buttons show a spinner while saving and a confirmation message
("Form saved."/"Form published.") once done.

> 📸 Screenshot: Form Builder — palette, canvas, and property panel
> 📸 Screenshot: Field Properties panel showing validation and conditional-visibility settings

---

## 4. Designing Workflows

A **workflow** is the approval process a submitted form goes through — who
needs to review it, and in what order. Only Admins can create or edit
workflows; Managers and Employees see a read-only list of existing ones.

Go to **Workflows** in the sidebar:

1. Type a name (e.g. "Expense Approval") into the input at the top and
   click **+ New Workflow**. Every new workflow starts with a default stage
   sequence (Draft → Submitted → Approved → Rejected).
2. Each workflow shows its stages as an editable list. You can:
   - **Add a stage** to insert a new review step (e.g. a "Manager Review"
     or "Finance Review" step between Submitted and Approved/Rejected).
   - **Edit a stage's name** directly.
   - **Reorder stages** by dragging them.
   - **Delete a stage** you no longer need.
3. Stages named **Approved** or **Rejected** are treated specially — they
   are always the final outcome of the process, and every earlier stage is
   walked through in the order you've arranged them.

To actually use a workflow, it needs to be **linked to a form**: open the
form in the **Form Builder** and pick the workflow from the **Workflow**
dropdown in the **Form Settings** panel (see Section 3). Every submission
of that form will then start its life in the workflow's very first stage.

Deleting a workflow asks for confirmation first, since any form still
linked to it would lose its approval stages.

> 📸 Screenshot: Workflow Configuration page — stage list for a workflow, in edit mode

---

## 5. Previewing Forms

The **Preview** page (reachable from the Form Builder via the **Preview →**
button) shows your form exactly as an end user filling it out would see it
— the same live, validated, multi-step-aware rendering used when someone
actually fills it in. Use this to check your work before publishing: try
triggering validation errors, toggling conditional fields on and off, and
stepping through a multi-step form's Previous/Next flow, all without
creating a real submission record until you actually click Submit.

A floating **JSON viewer** button in the corner lets you inspect the raw
schema behind the form (field definitions, metadata, and, after a
submission, the submitted values) — handy for confirming exactly what data
a form will collect.

> 📸 Screenshot: Preview page showing a form with an inline validation error
> 📸 Screenshot: Preview page mid-way through a multi-step form

---

## 6. Submitting Forms

Any signed-in user can fill out a form via the **Forms** page. Find the
form you need (use the search box, or the status/date filters if the list
is long), and click **Fill Form**. This opens the same Preview experience
described above, loaded with that specific form.

Fill in each field — required fields are marked, and you'll see an inline
error message if something's missing or invalid before you can move on.
Multi-step forms show a progress bar and a **Step X of N** label, and
always end with a **Review & Submit** step summarizing everything you
entered before you actually submit.

When you click **Submit**, your response is recorded and you'll see a
"Thank You" screen with a **reference number** (e.g. `FORM-000001`) you can
use to identify your submission later. If the form has a workflow linked to
it, your submission automatically enters that workflow's first stage (for
example, "Draft"). From here you can submit another response or jump
straight to **View Submissions**.

> 📸 Screenshot: The "Thank You" confirmation screen with a reference number

---

## 7. Reviewing Submissions

The **Submissions** page lists every response ever recorded, with search
(by submitter name, form name, or a response value like an email address),
a date filter, and a status filter (Approved / Pending / Rejected), plus
pagination for long lists.

Two role-scoped variants of this same list appear in the sidebar depending
on your role, so you only see what's relevant to you:

- **Pending Approvals** (Manager) — pre-filtered to only the submissions
  still awaiting a decision (anything not yet in a final Approved/Rejected
  stage).
- **My Submissions** (Employee) — pre-filtered to only the forms *you*
  personally submitted.

Both are the exact same underlying Submissions screen and share the same
search/filter/pagination controls — they're simply pre-scoped to a
relevant subset before you even start filtering.

Click any row to open its full detail view: the reference number, submit
date, current status badge, every response value you (or whoever submitted
it) entered, and — if the form has a linked workflow — the workflow
history and available actions described in Section 8 below.

> 📸 Screenshot: Submissions list with search/filter controls and pagination
> 📸 Screenshot: Pending Approvals view (Manager role)

---

## 8. Workflow Approval

Open a submission that belongs to a workflow-linked form to see its full
approval status. The detail view shows:

- **Current Status** — a colored badge for the submission's current stage.
- **Workflow History** (the **timeline**) — every stage the submission has
  passed through so far, shown as filled dots (reached) connected to hollow
  dots (not yet reached), each with the date/time and the person who acted,
  plus any comment they left.
- **Assigned To** — optionally assign the submission to a specific person
  for review, from a dropdown of the three demo accounts.
- **Actions** — the buttons you can click right now to move the submission
  forward. What you see here depends on both the submission's current stage
  and your own role:
  - At an early stage, you'll typically see a single **advance** action
    (labeled "Submit" at the very first stage, or "Move to <next stage>"
    afterward).
  - At the final review stage before a decision, you'll see **Approve** and
    **Reject** buttons instead.
  - Once a submission has reached Approved or Rejected, no further actions
    are shown — it's reached the end of its workflow.
  - Employees can only advance a submission through the sequential stages;
    only Managers and Admins can Approve or Reject. If your role can't act
    on the current stage, you'll see a message saying it's waiting on
    someone else instead of an action button.

Clicking **Approve** or **Reject** opens a small **comment dialog** first,
letting you add an optional remark explaining your decision — this comment
is saved permanently alongside that step in the timeline, so anyone
reviewing the history later can see not just *what* happened but *why*. A
plain "advance" action (like the initial Submit) completes immediately
without a comment prompt. After any action, a toast notification confirms
what just happened (e.g. "Request rejected." or "<name> approved the
request.").

> 📸 Screenshot: Submission detail view — timeline, assigned reviewer, and action buttons
> 📸 Screenshot: The comment dialog shown before confirming an Approve/Reject action
