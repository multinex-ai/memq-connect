# MemQ Multi-Agent Usage Guide

MemQ is a hosted, sovereign memory layer for AI agents, exposed over the Model
Context Protocol (MCP). It gives an agent durable recall across sessions and lets
multiple agents share a governed memory namespace.

- **Endpoint:** `https://mcp.multinex.ai/mcp/v1` (streamable HTTP)
- **Sign up:** https://billing.multinex.ai/signup
- **Dashboard:** https://billing.multinex.ai/dashboard

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

1. **Recall before acting.** Start a session with `mnemosyne_context` (objective string)
   to hydrate recent memory, learnings, and working memory; then `search_memory` /
   `query_memory` for specifics.
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
