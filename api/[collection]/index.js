// api/[collection]/index.js
// Collection-level endpoint: GET /api/:collection (list) and
// POST /api/:collection (create). The dynamic [collection] segment is one of
// forms | workflows | submissions (validated against the allow-list).

import { isValidCollection, readCollection, writeCollection } from "../_store.js";

export default async function handler(req, res) {
  const { collection } = req.query;
  if (!isValidCollection(collection)) {
    return res.status(404).json({ message: "Unknown collection" });
  }

  res.setHeader("Cache-Control", "no-store");
  const items = await readCollection(collection);

  if (req.method === "GET") {
    return res.status(200).json(items);
  }

  if (req.method === "POST") {
    const body = typeof req.body === "object" && req.body ? req.body : {};
    const record = { ...body };
    // The client generates its own ids; fall back to a json-server-style id.
    if (record.id == null) {
      const singular = collection.replace(/s$/, "");
      record.id = `${singular}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }
    // Upsert by id so a repeated create is idempotent (matches json-server).
    const next = [
      ...items.filter((item) => String(item.id) !== String(record.id)),
      record,
    ];
    await writeCollection(collection, next);
    return res.status(201).json(record);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ message: "Method not allowed" });
}
