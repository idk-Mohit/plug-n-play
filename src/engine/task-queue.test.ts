import { describe, expect, it } from "vitest";

import { PriorityTaskQueue } from "@/engine/task-queue";

describe("PriorityTaskQueue", () => {
  it("runs enqueued tasks", async () => {
    const q = new PriorityTaskQueue(2);
    const result = await q.enqueue("k", "high", 1, async () => 42);
    expect(result).toBe(42);
  });

  it("rejects superseded tasks", async () => {
    const q = new PriorityTaskQueue(1);
    const slow = q.enqueue(
      "k",
      "low",
      1,
      () => new Promise((r) => setTimeout(() => r("old"), 50)),
    );
    q.enqueue("k", "high", 2, async () => "new");
    await expect(slow).rejects.toMatchObject({ name: "AbortError" });
  });
});
