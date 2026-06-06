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
      fields: [],
      selectedFieldId: null,
      nextId: 1,

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

      removeField: (id) =>
        set((state) => ({
          fields: state.fields.filter((f) => f.id !== id),
          selectedFieldId:
            state.selectedFieldId === id ? null : state.selectedFieldId,
        })),

      updateField: (id, data) =>
        set((state) => ({
          fields: state.fields.map((f) =>
            f.id === id ? { ...f, ...data } : f
          ),
        })),

      selectField: (id) => set({ selectedFieldId: id }),

      resetForm: () =>
        set({ fields: [], selectedFieldId: null, nextId: 1 }),

      loadSchema: (fields) =>
        set((state) => ({
          fields,
          selectedFieldId: null,
          // keep ids unique even after loading an example schema
          nextId: Math.max(state.nextId, fields.length + 1),
        })),
    }),
    {
      name: "form-builder-schema",
      // Only the schema needs to survive a refresh — not the transient selection.
      partialize: (state) => ({ fields: state.fields, nextId: state.nextId }),
    }
  )
);

// Convenience selector: the full field object that's currently selected.
export const useSelectedField = () =>
  useFormStore((state) =>
    state.fields.find((f) => f.id === state.selectedFieldId) || null
  );
