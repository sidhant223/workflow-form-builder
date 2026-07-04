// src/pages/forms.jsx
// Route: /forms
// Lists saved forms: search by name, filter by status/created date, sort by
// name/date, paginate. Admins can create/edit/delete; every role can fill
// out a published-or-draft form via "Fill Form".

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormsStore } from "../store/formsStore";
import { useFormStore } from "../store/formStore";
import { useCurrentUser } from "../store/authStore";
import { canManageForms } from "../workflow/rolePermissions";
import { filterAndSortForms } from "../store/formsHelpers";
import { paginate } from "../utils/pagination";
import Spinner from "../components/ui/spinner";
import ErrorBanner from "../components/ui/errorBanner";
import EmptyState from "../components/ui/emptyState";
import Pagination from "../components/ui/pagination";
import Badge from "../components/ui/badge";
import Button from "../components/ui/button";

const DATE_FILTERS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All Statuses" },
  { value: "Draft", label: "Draft" },
  { value: "Published", label: "Published" },
];

const SORT_OPTIONS = [
  { value: "date", label: "Newest First" },
  { value: "name", label: "Name (A–Z)" },
];

const PAGE_SIZE = 5;

function Forms() {
  const forms = useFormsStore((s) => s.forms);
  const isLoading = useFormsStore((s) => s.isLoading);
  const error = useFormsStore((s) => s.error);
  const fetchForms = useFormsStore((s) => s.fetchForms);
  const deleteFormById = useFormsStore((s) => s.deleteFormById);
  const loadSchema = useFormStore((s) => s.loadSchema);
  const resetForm = useFormStore((s) => s.resetForm);
  const currentUser = useCurrentUser();
  const canManage = canManageForms(currentUser.role);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const updateStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const updateDateFilter = (value) => {
    setDateFilter(value);
    setPage(1);
  };

  const updateSortBy = (value) => {
    setSortBy(value);
    setPage(1);
  };

  const filtered = useMemo(
    () => filterAndSortForms(forms, { search, statusFilter, dateFilter, sortBy }),
    [forms, search, statusFilter, dateFilter, sortBy]
  );

  const { items: visible, totalPages } = useMemo(
    () => paginate(filtered, page, PAGE_SIZE),
    [filtered, page]
  );

  const handleNew = () => {
    resetForm();
    navigate("/form-builder");
  };

  const handleEdit = (form) => {
    loadSchema(form);
    navigate("/form-builder");
  };

  const handleFill = (form) => {
    loadSchema(form);
    navigate("/preview");
  };

  const handleDelete = (form) => {
    if (window.confirm(`Delete "${form.formName || "Untitled Form"}"? This cannot be undone.`)) {
      deleteFormById(form.id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="mt-1 text-gray-600">Browse, fill, and manage your saved forms.</p>
        </div>
        {canManage && <Button onClick={handleNew}>+ New Form</Button>}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          placeholder="Search by form name…"
          className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        />
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => updateStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by created date"
          value={dateFilter}
          onChange={(e) => updateDateFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        >
          {DATE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort by"
          value={sortBy}
          onChange={(e) => updateSortBy(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <Spinner label="Loading forms…" />
        ) : error ? (
          <div className="p-4">
            <ErrorBanner message={error} onRetry={fetchForms} />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="🗂️"
            title="No Forms Available"
            subtitle={canManage ? "Create your first form to get started." : undefined}
          />
        ) : (
          visible.map((form) => (
            <div
              key={form.id}
              className="flex items-center justify-between border-b border-gray-100 p-4 last:border-b-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800">{form.formName || "Untitled Form"}</p>
                  <Badge
                    text={form.status || "Draft"}
                    type={form.status === "Published" ? "success" : "neutral"}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {form.formDescription || "No description"} · Created{" "}
                  {new Date(form.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleFill(form)}
                  className="text-sm font-medium text-violet-600 hover:underline"
                >
                  Fill Form
                </button>
                {canManage && (
                  <>
                    <button
                      onClick={() => handleEdit(form)}
                      className="text-sm font-medium text-gray-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(form)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {!isLoading && !error && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}

export default Forms;
