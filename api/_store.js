// api/_store.js
// Shared storage layer for the serverless API that replaces json-server on
// Vercel. Each collection (forms, workflows, submissions) is persisted as a
// single JSON array in Upstash Redis (provisioned via Vercel's Marketplace
// "KV" / Upstash integration, which injects the REST credentials below).
//
// Files in /api prefixed with "_" are treated as private helpers by Vercel and
// are NOT exposed as routes.

import { Redis } from "@upstash/redis";

// The Vercel/Upstash integration may inject either the KV_* or UPSTASH_* names
// depending on how the store was created; accept both.
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const COLLECTIONS = ["forms", "workflows", "submissions"];

// Seed data mirrors the original db.json so a fresh store behaves identically
// to the local json-server: an empty forms/submissions list and the default
// "Leave Approval" workflow.
const SEEDS = {
  forms: [],
  workflows: [
    {
      id: "workflow_default_leave_approval",
      workflowName: "Leave Approval",
      stages: ["Draft", "Submitted", "Manager Review", "Approved", "Rejected"],
    },
  ],
  submissions: [],
};

const keyFor = (collection) => `wfb:${collection}`;

export function isValidCollection(collection) {
  return COLLECTIONS.includes(collection);
}

// Returns the collection array, seeding + persisting the default the first time
// a collection is accessed. Once seeded, an emptied collection stays empty
// (the key exists), so user deletions are never silently undone.
export async function readCollection(collection) {
  const existing = await redis.get(keyFor(collection));
  if (existing == null) {
    const seed = SEEDS[collection] ?? [];
    await redis.set(keyFor(collection), seed);
    return seed;
  }
  return existing;
}

export async function writeCollection(collection, items) {
  await redis.set(keyFor(collection), items);
  return items;
}
