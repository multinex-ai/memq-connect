---
description: Distributed team synchronization over MemQ — align namespaces across teammates' agents, approve context into team memory, and never ask the same question twice. Use whenever more than one person's agents share a MemQ namespace.
---

Use this skill when the work involves a team namespace (`org:{id}` / `org:{id}:shared`) — multiple humans, each running their own agents, sharing one memory.

## 1. Namespace alignment handshake (before anything else)

Recall only works across agents authenticated to the **same** namespace. Drift is silent: nothing errors, memory just stops being shared.

1. Run `reunion`, then `namespace_info`.
2. Confirm the result shows the expected org namespace (`org:{id}`), not a private tenant namespace.
3. When pairing with another person's agent, both sides compare `namespace_info` output — the `effective namespace` values must match exactly. If they differ, **stop and report the drift** before writing anything; do not proceed on the assumption that memory is shared.
4. Free plans see `_commons` only — a teammate on the wrong plan cannot join team recall. Say so rather than working around it.

## 2. Recall before you ask a human

Before asking a teammate (or the customer) a question, check whether the team already answered it:

1. `hybrid_retrieve` with the question against the team namespace.
2. `journal_search` for related `decision_point` records.
3. Only ask a human if both come back empty — and when they answer, save it (`add_memory` or `journal_record`) so it is the last time anyone asks.

## 3. The approve-in model for team memory

Private is the default; team memory is opt-in and deliberate.

- Work and explore in your private namespace.
- When a decision, fix, or runbook matters beyond you, promote it into the team namespace explicitly — one clean memory, not a transcript dump.
- What belongs in `org:` memory: decisions with reasons, customer commitments and preferences, API contracts, runbooks, review lessons.
- What never belongs there: raw conversation transcripts, secrets/credentials, personal scratch context, anything the customer has not approved for team visibility. Conversation content is private by default — extract the *fact*, not the chat.

## 4. Shared decision log

Any choice that affects someone else's work — API contracts, schema changes, naming, customer promises — gets a `journal_record` with `type: "decision_point"` in the team namespace, with the *why* in the content. `journal_search` must return the same audit trail to every teammate's agent, regardless of who made the call.

## 5. Relationship memory over time

Team namespaces shine for episodic, longitudinal context — especially sensitive customer relationships:

- Record commitments with dates ("SSO promised for Q4 — decided May 2").
- Recall with `mnemosyne_context` before customer-facing work so nothing promised is forgotten and nothing is asked twice.
- Use `temporal_graph_query` to reconstruct how a relationship or decision evolved over time.

## 6. When sync seems broken

- Two agents not seeing each other's memory → compare `namespace_info` (step 1); it is almost always drift.
- Writes visible to one agent only → check plan tier (`namespace_info` shows it) and quota (`memory_status`).
- For coordinated multi-step work across agents, switch to the `multi-agent-coordination` skill (plan-state claims, checkpoints, handoffs).
