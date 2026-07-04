export function isFieldVisible(field, values = {}) {
  if (!field.showIf || !field.showIf.field) return true;
  const actual = values[field.showIf.field];
  return String(actual ?? "") === String(field.showIf.value ?? "");
}
