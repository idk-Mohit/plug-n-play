---
name: system-design
description: >-
  Structured approach to system and API design: requirements, boundaries, data
  flow, scalability tradeoffs, and interface design. Use when designing features,
  sketching architectures, reviewing scalability, discussing tradeoffs, or when
  the user mentions system design, backend integration, APIs, or distributed systems.
---

# System design (Plug & Play context)

Use this for **design discussions** and **feature shaping**. Implementation constraints for this repo remain in `AGENTS.md` and `src/README.md`.

## Clarify the problem first

- **Users and workflows**: who acts, what’s the happy path, what fails?
- **Scale assumptions**: data size, request rates, latency expectations, offline vs online.
- **Consistency**: what must be strongly consistent vs eventually consistent?

## Boundaries

- Draw **boxes**: UI, client state, data engine / RPC, storage, workers, external services.
- For Plug & Play, heavy work belongs in **`src/compute/`** and **`src/engine/`** (workers), not in React render.

## Interfaces

- Prefer **narrow**, version-friendly contracts between layers (clear types, explicit errors).
- For APIs: pagination, filtering, idempotency for mutations where relevant; document failure modes.

## Tradeoffs (template)

When comparing options, capture:

| Option | Pros | Cons | Fits this repo when |
|--------|------|------|---------------------|
| A | | | |
| B | | | |

## Scalability patterns (pick with intent)

- **Read scaling**: caching, preaggregation, incremental results.
- **Write scaling**: batching, queues, idempotent handlers.
- **Client**: virtualization for large lists; incremental chart updates; avoid shipping huge payloads to the UI thread.

## Output style

- Start with a short **architecture summary**, then **data flow** (1–2 diagrams in text/mermaid if helpful), then **risks** and **next steps**.
- Avoid buzzwords without tying them to a concrete requirement.
