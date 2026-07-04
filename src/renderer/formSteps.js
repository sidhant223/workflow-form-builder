export function groupFieldsBySection(fields, sections = []) {
  if (!sections.length) {
    return [{ id: null, name: null, fields }];
  }

  const firstId = sections[0].id;
  const buckets = new Map(sections.map((s) => [s.id, []]));

  fields.forEach((field) => {
    const key = buckets.has(field.sectionId) ? field.sectionId : firstId;
    buckets.get(key).push(field);
  });

  return sections.map((s) => ({ id: s.id, name: s.name, fields: buckets.get(s.id) }));
}
