---
name: multi-agent-coordination
description: "Coordinate an already authorized multi-agent task using MemQ plans, checkpoints, and handoffs without treating plan records as locks."
---

# Coordinate existing agent work

Use for an authorized task involving multiple agents or a resumed session. This skill does not authorize spawning agents. Verify each connection's identity and intended project scope before protected operations.

Read the current task plan and artifact revision before editing. Record agreed ownership and boundaries with the available plan tools only when authorized. A plan record or timestamp does not prove exclusive ownership: use an actual coordinator or verified atomic lease with fencing for contested changes. Do not seize stale-looking work or overwrite another agent's checkpoint silently.

At meaningful phase boundaries, save a concise checkpoint with completed work, validation evidence, pending side effects, blockers, and next action. Inspect receipts and reconcile ambiguous writes before retrying.

A receiving agent reads the targeted handoff and checks current source/service state. Resolve contradictions before acting. Use reflection_handoff or the corresponding live tool only within the authorized shared scope.

Do not run lifecycle sweeps, delete stale records, bridge deployments, or transfer cross-organization context just to tidy a task. Those operations have separate scope and authorization requirements.
