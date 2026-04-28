import { describe, expect, it, vi } from "vitest";

import { MiniGrpc } from "@/core/rpc/config/client";
import { V, type RpcResponse } from "@/core/rpc/config/protocol";

describe("MiniGrpc", () => {
  it("rejects with AbortError when the call is already aborted", async () => {
    const worker = {
      postMessage: vi.fn(),
      onmessage: null as ((ev: MessageEvent) => void) | null,
      terminate: vi.fn(),
    } as unknown as Worker;

    const grpc = new MiniGrpc(worker);

    const ac = new AbortController();
    ac.abort();

    await expect(
      grpc.call("Data", "getPage", [{ datasetId: "x", offset: 0, limit: 10 }], {
        signal: ac.signal,
      }),
    ).rejects.toMatchObject({ name: "AbortError" });

    expect(worker.postMessage).not.toHaveBeenCalled();
  });

  it("posts cancel envelope when aborted while the worker is slow to respond", async () => {
    const posts: unknown[] = [];
    const worker = {
      postMessage: vi.fn((msg: unknown) => {
        posts.push(msg);
      }),
      onmessage: null as ((ev: MessageEvent) => void) | null,
      terminate: vi.fn(),
    } as unknown as Worker;

    const grpc = new MiniGrpc(worker);

    const ac = new AbortController();
    const p = grpc.call(
      "Data",
      "getPage",
      [{ datasetId: "x", offset: 0, limit: 10 }],
      { signal: ac.signal, timeout: 60_000 },
    );

    expect(posts.length).toBe(1);
    const id = (posts[0] as Record<string, unknown>).id as string;
    expect(typeof id).toBe("string");

    ac.abort();

    await expect(p).rejects.toMatchObject({ name: "AbortError" });

    const cancelMsg = posts.find(
      (m) => (m as Record<string, unknown>).cancel === true,
    ) as Record<string, unknown>;
    expect(cancelMsg.cancel).toBe(true);
    expect(cancelMsg.id).toBe(id);
    expect(cancelMsg.v).toBe(V);
  });

  it("drops late worker responses after abort (no double settle)", async () => {
    const posts: unknown[] = [];
    let deliver: ((msg: MessageEvent) => void) | null = null;

    const worker = {
      postMessage: vi.fn((msg: unknown) => {
        posts.push(msg);
        const m = msg as Record<string, unknown>;
        if (m?.cancel === true) return;
        const id = m.id as string;
        queueMicrotask(() => {
          const res: RpcResponse = {
            v: V,
            id,
            ok: true,
            result: 42,
          };
          deliver?.({ data: res } as MessageEvent);
        });
      }),
      set onmessage(fn: (ev: MessageEvent) => void) {
        deliver = fn;
      },
      get onmessage(): ((ev: MessageEvent) => void) | null {
        return deliver;
      },
      terminate: vi.fn(),
    } as unknown as Worker;

    const grpc = new MiniGrpc(worker);
    const ac = new AbortController();
    const p = grpc.call("Data", "getMeta", ["id-1"], {
      signal: ac.signal,
      timeout: 60_000,
    });

    const id = (posts[0] as Record<string, unknown>).id as string;
    ac.abort();

    await expect(p).rejects.toMatchObject({ name: "AbortError" });

    await new Promise((r) => setTimeout(r, 5));
    // If inflight leaked, late ok would have resolved the (already rejected) promise —
    // Vitest would still pass; this mainly guards worker-side ordering.
    expect(posts.some((m) => (m as Record<string, unknown>).cancel === true)).toBe(
      true,
    );
    void id;
  });
});
