// src/store/formStore.js
// -----------------------------------------------------------------------------
// Global Form Builder state (Zustand) — the single source of truth for the
// form schema the user is building.
//
// State:
//   fields:          [] of schema objects (see src/schemas/formSchema.js)
//   selectedFieldId: id of the field currently open in the property panel
//   nextId:          counter used to mint unique, stable field ids
//
// Actions:
//   addField(type)        – auto-generate a field and append it (Add field)
//   removeField(id)       – delete a field            (Delete field)
//   updateField(id, data) – patch a field's props     (Update field)
//   selectField(id)       – open a field in the panel
//   resetForm()           – clear the whole form       (Reset form)
//   loadSchema(fields)    – replace the form with a given schema
//
// Persistence: the `persist` middleware mirrors the schema to localStorage
// (key "form-builder-schema"), so a page refresh reloads the form automatically.
// -----------------------------------------------------------------------------

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createField } from "../schemas/formSchema";

export const useFormStore = create(
  persist(
    (set) => ({
      // Form metadata
      id: null,
      status: "Draft",
      formName: "",
      formDescription: "",
      createdBy: "",
      version: "1.0",
      workflowId: null,

      // Form structure
      fields: [],
      sections: [],
      selectedFieldId: null,
      nextId: 1,
      nextSectionId: 1,

      // Add field
      addField: (type) =>
        set((state) => {
          const id = `field_${state.nextId}`;
          const field = createField(type, id);
          return {
            fields: [...state.fields, field],
            selectedFieldId: id,
            nextId: state.nextId + 1,
          };
        }),

      // Remove field
      removeField: (id) =>
        set((state) => ({
          fields: state.fields.filter((f) => f.id !== id),
          selectedFieldId:
            state.selectedFieldId === id ? null : state.selectedFieldId,
        })),

      // Update field
      updateField: (id, data) =>
        set((state) => ({
          fields: state.fields.map((f) =>
            f.id === id ? { ...f, ...data } : f
          ),
        })),

      // Duplicate field
      duplicateField: (id) =>
        set((state) => {
          const fieldToDuplicate = state.fields.find((f) => f.id === id);
          if (!fieldToDuplicate) return state;

          const newId = `field_${state.nextId}`;
          const duplicated = {
            ...fieldToDuplicate,
            id: newId,
            label: `${fieldToDuplicate.label} Copy`,
          };

          const fieldIndex = state.fields.findIndex((f) => f.id === id);
          const newFields = [
            ...state.fields.slice(0, fieldIndex + 1),
            duplicated,
            ...state.fields.slice(fieldIndex + 1),
          ];

          return {
            fields: newFields,
            selectedFieldId: newId,
            nextId: state.nextId + 1,
          };
        }),

      // Reorder fields
      reorderFields: (fromIndex, toIndex) =>
        set((state) => {
          const newFields = [...state.fields];
          const [movedField] = newFields.splice(fromIndex, 1);
          newFields.splice(toIndex, 0, movedField);
          return { fields: newFields };
        }),

      // Select field
      selectField: (id) => set({ selectedFieldId: id }),

      // Update form metadata
      updateFormMetadata: (metadata) =>
        set((state) => ({
          ...state,
          ...metadata,
        })),

      // Add section
      addSection: (name = "New Section") =>
        set((state) => {
          const id = `section_${state.nextSectionId}`;
          const section = { id, name, fields: [] };
          return {
            sections: [...state.sections, section],
            nextSectionId: state.nextSectionId + 1,
          };
        }),

      // Update section
      updateSection: (id, data) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),

      // Remove section
      removeSection: (id) =>
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== id),
        })),

      // Reset form
      resetForm: () =>
        set({
          id: null,
          status: "Draft",
          fields: [],
          sections: [],
          selectedFieldId: null,
          formName: "",
          formDescription: "",
          createdBy: "",
          version: "1.0",
          workflowId: null,
          nextId: 1,
          nextSectionId: 1,
        }),

      // Load schema
      loadSchema: (data) =>
        set((state) => {
          const fieldCount = data.fields ? data.fields.length : 0;
          const sectionCount = data.sections ? data.sections.length : 0;
          return {
            id: data.id || null,
            status: data.status || "Draft",
            fields: data.fields || [],
            sections: data.sections || [],
            selectedFieldId: null,
            formName: data.formName || "",
            formDescription: data.formDescription || "",
            createdBy: data.createdBy || "",
            version: data.version || "1.0",
            workflowId: data.workflowId || null,
            nextId: Math.max(state.nextId, fieldCount + 1),
            nextSectionId: Math.max(state.nextSectionId, sectionCount + 1),
          };
        }),
    }),
    {
      name: "form-builder-schema",
      partialize: (state) => ({
        id: state.id,
        status: state.status,
        fields: state.fields,
        sections: state.sections,
        formName: state.formName,
        formDescription: state.formDescription,
        createdBy: state.createdBy,
        version: state.version,
        workflowId: state.workflowId,
        nextId: state.nextId,
        nextSectionId: state.nextSectionId,
      }),
    }
  )
);

export const useSelectedField = () =>
  useFormStore((state) =>
    state.fields.find((f) => f.id === state.selectedFieldId) || null
  );
