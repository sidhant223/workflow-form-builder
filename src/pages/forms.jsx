// src/pages/forms.jsx
// Route: /forms
// Lists saved forms: search by name, filter by status/created date, sort by
// name/date, paginate. Admins can create/edit/delete; every role can fill
// out a published-or-draft form via "Fill Form".

import { useCallback, useEffect, useMemo, useState } from "react";
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
import Button from "../components/ui/button";
import ConfirmDialog from "../components/ui/confirmDialog";
import FormRow from "../components/forms/FormRow";
import { DATE_FILTER_OPTIONS } from "../utils/dateFilter";

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
  const [formPendingDelete, setFormPendingDelete] = useState(null);

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

  const handleEdit = useCallback(
    (form) => {
      loadSchema(form);
      navigate("/form-builder");
    },
    [loadSchema, navigate]
  );

  const handleFill = useCallback(
    (form) => {
      loadSchema(form);
      navigate("/preview");
    },
    [loadSchema, navigate]
  );

  const handleDelete = useCallback((form) => {
    setFormPendingDelete(form);
  }, []);

  const confirmDelete = useCallback(() => {
    deleteFormById(formPendingDelete.id);
    setFormPendingDelete(null);
  }, [deleteFormById, formPendingDelete]);

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
          {DATE_FILTER_OPTIONS.map((f) => (
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
            <FormRow
              key={form.id}
              form={form}
              canManage={canManage}
              onFill={handleFill}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {!isLoading && !error && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <ConfirmDialog
        isOpen={Boolean(formPendingDelete)}
        title="Delete Form"
        message={`Delete "${formPendingDelete?.formName || "Untitled Form"}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setFormPendingDelete(null)}
      />
    </div>
  );
}

export default Forms;
