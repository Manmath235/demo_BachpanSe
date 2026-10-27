import { describe, expect, it } from "vitest";
import { seedContent } from "@/lib/bachpanse/content";
import { contentToRows, rowsToContent } from "@/lib/bachpanse/cloud";

describe("content <-> Supabase rows", () => {
  it("round-trips the seed content without losing anything", () => {
    const seed = seedContent();
    const back = rowsToContent(contentToRows(seed));
    expect(back).toEqual(seed);
  });

  it("carries each item's status so RLS can hide drafts from the app", () => {
    const rows = contentToRows(seedContent());
    const draft = rows.filter((r) => r.status === "draft");
    expect(draft.length).toBeGreaterThan(0);
    expect(draft.every((r) => (r.payload as { status: string }).status === "draft")).toBe(true);
  });

  it("uses unique (kind, id) keys", () => {
    const rows = contentToRows(seedContent());
    const keys = new Set(rows.map((r) => `${r.kind}:${r.id}`));
    expect(keys.size).toBe(rows.length);
  });
});
