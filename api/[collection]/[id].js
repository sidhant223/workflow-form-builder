// api/[collection]/[id].js
// Item-level endpoint: GET / PUT / DELETE on /api/:collection/:id.
// Mirrors json-server semantics: PUT replaces the record, DELETE returns {}.

import { isValidCollection, readCollection, writeCollection } from "../_store.js";

export default async function handler(req, res) {
  const { collection, id } = req.query;
  if (!isValidCollection(collection)) {
    return res.status(404).json({ message: "Unknown collection" });
  }

  res.setHeader("Cache-Control", "no-store");
  const items = await readCollection(collection);
  const index = items.findIndex((item) => String(item.id) === String(id));

  if (req.method === "GET") {
    if (index === -1) return res.status(404).json({ message: "Not found" });
    return res.status(200).json(items[index]);
  }

  if (req.method === "PUT") {
    const body = typeof req.body === "object" && req.body ? req.body : {};
    const record = { ...body, id };
    const next = [...items];
    if (index === -1) next.push(record);
    else next[index] = record;
    await writeCollection(collection, next);
    return res.status(200).json(record);
  }

  if (req.method === "DELETE") {
    if (index === -1) return res.status(404).json({ message: "Not found" });
    const next = items.filter((item) => String(item.id) !== String(id));
    await writeCollection(collection, next);
    return res.status(200).json({});
  }

  res.setHeader("Allow", "GET, PUT, DELETE");
  return res.status(405).json({ message: "Method not allowed" });
}
