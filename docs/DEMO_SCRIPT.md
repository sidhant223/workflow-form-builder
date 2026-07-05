# Demo Script — Workflow / Dynamic Form Builder

Recorded-demo talking points for a live-application screen capture (Week 8 /
final-week deliverable). Read this as a script: perform each **Do** step while
narrating the **Say** line(s). Assumes both the mock API and the dev server
are already running (`npm run dev:all` → API on `http://localhost:4000`, app
on `http://localhost:5173`) and the browser starts on a fresh, signed-out
session.

## Timing overview

| # | Scene | Budget | Running total |
|---|-------------------------|--------|----------------|
| 1 | Login | 0:45 | 0:45 |
| 2 | Dashboard | 1:15 | 2:00 |
| 3 | Form Builder | 3:30 | 5:30 |
| 4 | Workflow Configuration | 1:30 | 7:00 |
| 5 | Form Preview | 1:00 | 8:00 |
| 6 | Form Submission | 1:30 | 9:30 |
| 7 | Workflow Approval | 2:15 | 11:45 |
| 8 | Submission Review | 1:00 | 12:45 |
| 9 | Responsive View | 1:00 | 13:45 |
| 10 | Wrap-up | 0:45 | 14:30 |

**Total: ~14.5 minutes** — inside the 10–15 minute target.

---

### Scene 1 — Login (0:45)

**Do:** Open `http://localhost:5173` (it redirects to `/login`). Point at the
"Demo accounts" box at the bottom of the card. Type `admin@test.com` /
`password123` into Email/Password and click **Login**.

**Say:** "This is FormFlow — a workflow and dynamic form builder. Every route
except Login sits behind a protected route, so this is where we start. The
box at the bottom lists all three demo accounts — Admin, Manager, and
Employee — all sharing the password `password123`. I'll sign in as Admin
first."

---

### Scene 2 — Dashboard (1:15)

**Do:** After login you land on `/dashboard`. Point at the four KPI cards
(Pending Reviews, Approved Today, Rejected, Draft Forms), then the two charts
below them (**Forms by Status** bar chart, **Workflow Distribution** pie
chart), then the **Recent Submissions** list and its **View All** link.

**Say:** "The dashboard gives a live read on every submission in the system —
these KPI cards and both charts are computed directly from the submissions
and workflows stores, not hard-coded. Right now the data is empty since this
is a clean session, but it updates immediately as forms are submitted and
approved later in this demo."

---

### Scene 3 — Form Builder (3:30)

**Do:** Click **Forms** in the sidebar, then **+ New Form** (Admin-only
button) to land on `/form-builder` with an empty canvas.

1. Drag the **Dropdown** card from the left Field Types palette onto the
   canvas. Select it and, in the Properties panel, rename its **Label** to
   "Leave Type" and edit its **Options** list to `Sick`, `Vacation`, `Unpaid`.
2. Drag a **Text Input** card onto the canvas below it. Select it and set
   **Label** to "Reason Details", **Placeholder** to "Explain the reason for
   unpaid leave", and toggle **Required** on.
3. Scroll down to the length-validation fields and set **Min Length** to
   `10` — point out this becomes a react-hook-form validation rule.
4. Scroll to **"Show this field only when…"** and set the target field to
   "Leave Type" with expected value `Unpaid`.
5. Scroll up to **Form Settings**: set **Form Name** to "Leave Request", and
   set the **Workflow** dropdown to the pre-seeded "Leave Approval" workflow.
6. Click **Save** (toast: "Form saved."), then click **Publish** (toast:
   "Form published.") — point out the button's loading spinner while each
   request is in flight.

**Say:** "Every field here is schema-driven — dragging a palette item just
appends a plain JSON object to a Zustand store; there's no hard-coded markup
per field type. I'm configuring the Reason Details field's label and
placeholder, adding a minimum-length validation rule, and — this is the
conditional visibility feature — telling it to only appear once someone picks
'Unpaid' as the leave type. Down in Form Settings I'm linking this form to
the 'Leave Approval' workflow we'll look at next, then saving and publishing
it."

---

### Scene 4 — Workflow Configuration (1:30)

**Do:** Click **Workflows** in the sidebar (`/workflow`). Locate the
"Leave Approval" card and its five stages (Draft, Submitted, Manager Review,
Approved, Rejected). Type "HR Review" into the new-stage input and click
**+ Add Stage**; then click the **↑** arrow once to move it above "Approved".
Briefly mention the read-only view.

**Say:** "A workflow is just a named, ordered list of stages. Only the Admin
role can edit them — Managers and Employees get a read-only card instead.
I'll add an 'HR Review' stage and reorder it with the up arrow; the stage
list drives which actions are available on a submission, so this change is
immediately reflected in the approval flow."

---

### Scene 5 — Form Preview (1:00)

**Do:** Navigate to `/preview` (still signed in as Admin, form loaded from
the builder). Show the rendered "Leave Request" form. Change **Leave Type**
to "Unpaid" and point out that **Reason Details** appears. Click **Submit**
with Reason Details empty and show the inline validation error, then fill it
in (10+ characters) without submitting yet.

**Say:** "This is the exact same rendering engine that powers the builder's
canvas — same schema, same field registry. Watch what happens when I switch
Leave Type to Unpaid: the Reason Details field appears live, because its
`showIf` condition is now met. If I try to submit without meeting the minimum
length, react-hook-form blocks it with an inline error instead of a native
browser popup."

---

### Scene 6 — Form Submission (1:30)

**Do:** Open the profile menu (top-right) and click **Logout**. Sign back in
as `employee@test.com` / `password123`. Click **Forms** in the Employee
sidebar, find "Leave Request", and click **Fill Form**. On `/preview`, select
**Leave Type: Unpaid**, fill in **Reason Details**, and click **Submit**.

**Say:** "Now I'm the Employee — a different, more limited sidebar: just
Dashboard, Forms, and My Submissions. I'll fill out the same Leave Request
form for real this time and submit it. That Thank You screen with a reference
number confirms it's been recorded in the submission store, starting life in
the workflow's first stage — Draft."

---

### Scene 7 — Workflow Approval (2:15)

**Do:** Logout, sign back in as `manager@test.com` / `password123`. Click
**Pending Approvals** in the Manager sidebar (`/pending-approvals`), find the
submission just created, and click **View Details**. In the modal:

1. Click **Submit** (advances Draft → Submitted).
2. Click **Move to Manager Review**.
3. Click **Approve** — the comment dialog opens ("Approve — Add a Comment").
   Type a remark (e.g. "Approved — documentation complete") and confirm.
4. Point at the **Workflow Timeline** now showing every stage filled in, and
   the toast confirming the approval.

**Say:** "As Manager I can see every submission waiting on my review. Opening
one shows its full history and the actions available for its *current*
stage — that list is generated from the workflow's stage array, not
hard-coded per form. I'll advance it through Submitted and Manager Review,
then Approve it. Approve and Reject both prompt for an optional comment
first, and everything — stage, action, who did it, and the comment — gets
appended to this audit-trail timeline."

---

### Scene 8 — Submission Review (1:00)

**Do:** Go to `/dashboard` and click **View All** next to Recent Submissions
to reach `/submissions`. Demonstrate the search box, the date filter, and the
status filter (Approved/Pending/Rejected); page through results if more than
one page exists.

**Say:** "The Submissions page is the same list every role can reach — search
matches names, form names, and even response values like an email address.
Add a status or date filter, and everything re-paginates automatically."

---

### Scene 9 — Responsive View (1:00)

**Do:** Open browser dev tools and switch to the device toolbar (e.g. an
iPhone or Pixel preset). Reload or navigate a page. Show the sidebar is gone
by default; click the **☰** hamburger icon in the header to slide it in, then
tap the dark overlay to close it.

**Say:** "The whole app is responsive — below the medium breakpoint the
sidebar collapses into a slide-in drawer, opened with this hamburger icon and
closed by tapping outside it. The Form Builder's three-column layout also
collapses to a single column on small screens."

---

### Scene 10 — Wrap-up (0:45)

**Do:** Return to desktop view. Face the camera/mic (or simply stop
navigating) for the closing remarks.

**Say:** "That's Workflow Form Builder end to end — a schema-driven form
engine, drag-and-drop building with @dnd-kit, validation and conditional
logic through react-hook-form, and a configurable workflow engine with
role-based approvals, built on React 19, Vite, Tailwind CSS 4, Zustand, React
Router, and an Axios-backed REST layer against a json-server mock API. It's
fully tested with Vitest, and ships with a `vercel.json` so it's ready to
deploy as-is. Thanks for watching."

---

## Recording tips

- **Responsive scene:** use your browser dev tools' device toolbar
  (Chrome/Edge: `Ctrl+Shift+M`) to simulate a phone viewport — no physical
  device needed.
- **Take structure:** record one continuous take per major section (Scenes
  1–2, 3–5, 6–7, 8–10) rather than one single unbroken take, so a mistake only
  costs you a short re-record instead of the whole video.
- **Mouse movements:** move deliberately and pause briefly before clicking —
  fast or jittery cursor movement is hard to follow on a recorded video.
- **Before recording:** clear `localStorage`/`sessionStorage` (or use a fresh
  browser profile) so the Login scene's "fresh session" and the empty
  Dashboard in Scene 2 are accurate, and confirm `npm run dev:all` is running
  both the mock API and the dev server.
- **Audio:** narrate in full sentences at a steady pace; it's easier to trim
  dead air in editing than to fix rushed narration.
