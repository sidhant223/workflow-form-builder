// src/utils/moveItem.js
// Pure "move an array item from one index to another" helper, shared by
// every reorder action (form fields, workflow stages).

export function moveItem(items, fromIndex, toIndex) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
