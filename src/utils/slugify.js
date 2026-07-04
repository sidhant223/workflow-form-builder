export function slugify(text, fallback = "untitled_form") {
  if (!text) return fallback;

  const slug = text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return slug || fallback;
}
