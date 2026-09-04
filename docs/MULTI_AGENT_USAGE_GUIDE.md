# MemQ Multi-Agent Usage Guide

MemQ is a hosted, sovereign memory layer for AI agents, exposed over the Model
Context Protocol (MCP). It gives an agent durable recall across sessions and lets
multiple agents share a governed memory namespace.

- **Endpoint:** `https://mcp.multinex.ai/mcp/v1` (streamable HTTP)
- **Sign up:** https://billing.multinex.ai/signup
- **Dashboard:** https://billing.multinex.ai/dashboard
- **Deep architecture reference:** [`docs/MEMQ_FULL_SYSTEM_SPEC.md`](../../docs/MEMQ_FULL_SYSTEM_SPEC.md)
  — this guide covers how to *use* MemQ; the spec covers how it's built.

## Connecting

MemQ supports two client auth modes:

### OAuth (interactive clients — recommended)
Discovery: `https://billing.multinex.ai/.well-known/oauth-authorization-server`.
Clients that speak MCP OAuth (e.g. Claude Code via `mcp-remote`) complete the
authorize/token flow automatically against `billing.multinex.ai`. Scope: `memq.mcp`.

### API key (static clients)
Issue a key from the dashboard and send it as a bearer token:

```
Authorization: Bearer <your-memq-key>
```

With `mcp-remote`:

```jsonc
{
  "memq": {
    "command": "npx",
    "args": ["-y", "mcp-remote@latest", "https://mcp.multinex.ai/mcp/v1"],
    "env": { "MEMQ_API_KEY_AUTH_HEADER": "Bearer <your-memq-key>" }
  }
}
```

## The core loop

1. **Recall before acting.** Open a session in this order:
   1. `reunion` — handshake; confirms protocol version, auth posture, and deployment mode.
   2. `namespace_info` — confirms the active namespace, plan tier, and access boundary.
   3. `mnemosyne_context` (objective string) — hydrates recent memory, learnings, and
      working memory for the task at hand.
   4. `search_memory` / `query_memory` for specifics beyond what `mnemosyne_context` returned.

   `reunion` and `namespace_info` are free system calls (they don't count against
   quota) and establish who you are and what you can see before you load or act on
   anything — always run them first, in that order.

   > If you're an agent working *inside* the memq codebase itself, `core/CLAUDE.md`
   > specifies a shorter `memory_status` → `recent_memory` → `search_memory` sequence.
   > That's intentional, not a contradiction: it's a lighter-weight check for agents
   > modifying memq's own source, not for agents consuming it as a memory backend.
2. **Act** on the task.
3. **Record after.** `add_memory` for a durable fact/decision, `journal_record` for a
   decision/failure→fix, `reflect_memory` to consolidate at the end of a long session.

## Namespaces and multi-agent sharing

Memory is bounded by an authenticated namespace, derived from your plan:

| Plan | Namespaces |
| --- | --- |
| FREE | `_commons` (read/bootstrap visibility only) |
| BASE / VERIFIED | `_commons` + one private tenant namespace |
| TEAM | `_commons` + `org:{id}` + `org:{id}:shared` |

Multiple agents authenticated to the same namespace share recall. Use the shared
commons tools (`commons_search`, `commons_resonance`) for cross-tenant collective
knowledge, and `plan_state_write` / `plan_state_read` / `plan_state_checkpoint` so one
agent can durably hand a multi-step plan to another.

## Pair AI developer workflow

Two agents working the same task (e.g. a "driver" writing code and a "navigator"
reviewing/planning, or two agents split across frontend/backend) should authenticate
to the **same namespace** (TEAM plan, or a shared BASE/VERIFIED tenant namespace) so
recall is shared rather than siloed per-agent.

- **Dividing and handing off multi-step work:** the driver calls `plan_state_write`
  with a `plan_id` describing the overall task and its current `state_patch`. The
  navigator (or the driver resuming after a break) calls `plan_state_read` with the
  same `plan_id` to pick up exactly where the plan stood — no need to re-explain
  context in the chat transcript. Use `plan_state_checkpoint` at phase boundaries and
  `plan_state_resume` when either agent's session restarts.
- **Explicit developer-to-developer handoff:** when one agent finishes its half of the
  work and the other needs to continue, call `reflection_handoff` to move the
  architectural decisions and execution summary into the shared namespace as a
  structured record, rather than relying on the receiving agent to re-derive intent
  from raw code diffs.
- **Shared decision log:** both agents should `journal_record` (`type:
  "decision_point"`) for choices either one makes that affects the other's work —
  API contracts, schema changes, naming — so `journal_search` gives either agent the
  same audit trail regardless of which one made the call.
- **Avoid namespace drift:** don't let one agent default to a private per-session
  namespace while the other uses the shared one — recall silently stops working
  across the pair if their authenticated namespaces diverge. Confirm both agents see
  the same `namespace_info` result before starting.

## Tool families

- **Context & memory:** `mnemosyne_context`, `add_memory`, `save_context`,
  `search_memory`, `query_memory`, `recent_memory`, `hybrid_retrieve`
- **Brain & reflection:** `brain_associate`, `brain_discover`, `brain_recall_episode`,
  `brain_predict`, `brain_reinforce`, `brain_consolidate_sleep`, `reflect_memory`
- **Journaling:** `journal_record`, `journal_search`, `journal_distill`
- **Plan state / handoff:** `plan_state_write`, `plan_state_read`,
  `plan_state_checkpoint`, `plan_state_resume`, `reflection_handoff`, `bridge_sync`
- **Commons:** `commons_search`, `commons_resonance`, `commons_promotion_status`,
  `commons_retract`
- **Graph & system:** `temporal_graph_query`, `slicer_slice`, `slice_project`,
  `health_check`, `memory_status`, `namespace_info`, `reunion`

> Argument note: `search_memory` / `query_memory` / `hybrid_retrieve` take `top_k`;
> `recent_memory` / `mnemosyne_context` take `limit`. `add_memory` content goes in
> `text`; `save_context` content goes in `content`. `journal_record.type` is one of
> `decision_point` | `failure_record` | `reflection` | `checkpoint`.

## Health

```bash
curl -s -o /dev/null -w '%{http_code}' https://mcp.multinex.ai/health   # expect 200
```

## Troubleshooting

- **First call after a session opens times out.** The connection is still warming
  up — this is not an outage. Retry once. If it still fails, check `health_check`
  for `backends.vectorStore` / `backends.graphMirror` status and confirm the
  backend curl above returns `200`.
- **A tool call fails with a schema/argument error.** Argument names are
  inconsistent across tools — see the note at the end of the Tool families section
  above (`top_k` vs `limit`, `text` vs `content`).
- **Two paired agents aren't seeing each other's memory.** Compare `namespace_info`
  results from both agents — recall only works across agents authenticated to the
  *same* namespace (see Pair AI developer workflow above).

## Known limitations

This section exists so a new pair of agents doesn't assume more operational
maturity than currently exists:

- **pathfinder-daemon** (sentiment/world-sense enrichment feeding Nexus Ranger) has
  no CI deploy step, audit entry, or health probe anywhere in this repo yet — its
  liveness can't currently be verified by automation.
- **status-worker** (the public status aggregator at `status.multinex.ai`) has no
  dedicated deploy workflow of its own; it's only indirectly exercised by the
  broader layer audit.
- **vybe-ranger** is a retired service — it now only returns a static
  `{"status":"retired","successor":"nexus-ranger"}` payload — but is still deployed
  by CI on every release.

None of these affect the hosted MCP tool surface this guide covers; they're
noted here for anyone extending MemQ's infrastructure, not for typical MCP clients.
