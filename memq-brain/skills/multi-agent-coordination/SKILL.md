---
description: Multi-agent coordination over MemQ — claim work with plan_state, checkpoint at phase boundaries, resume durably after restarts, and hand work forward with reflection_handoff. Use whenever two or more agents (or two sessions of one agent) work the same task.
---

Use this skill whenever more than one agent session touches the same task: pair-agent work (driver/navigator), background + interactive agents, CI agents alongside editors, or one agent resuming after a restart.

## 1. Claiming work — avoid duplicate effort

`plan_state_*` is the coordination primitive. One plan per task, addressed by a stable `plan_id`/`task_id`.

1. Before starting a task another agent might also pick up, call `plan_state_read` with the task's `plan_id`.
   - A live plan owned by another agent and recently checkpointed → the work is claimed. Do not duplicate it; pick another task or coordinate through a handoff.
   - No plan, or a stale one → claim it: `plan_state_write` with the `plan_id`, your agent identity, the objective, and the current `state_patch`.
2. Write the claim **before** doing the work, not after — the write is what other agents check.

## 2. Checkpoint cadence

- `plan_state_checkpoint` at every phase boundary (plan agreed, implementation done, verification passed) and before anything risky.
- The checkpoint carries enough state that a stranger could continue: what is done, what is next, what is blocked, and any invariants discovered.
- Long-running work: checkpoint at least whenever you would hate to lose the progress.

## 3. Resuming — durable, not vibes

On session start (after `reunion` / `namespace_info`):

1. `plan_state_resume` with the `plan_id` (or the most recent plan for this task family). This reloads the durable plan — do **not** reconstruct state from `recent_memory` when a checkpoint exists.
2. `temporal_graph_query` for "what happened while I was away" when other agents may have advanced shared state in the meantime.
3. Continue from the checkpoint's "what is next", not from the beginning.

## 4. Handing work forward

When one agent finishes its half and another continues:

1. `reflection_handoff` — move the architectural decisions, execution summary, and open questions into the shared namespace as a structured record. The receiver should never have to re-derive intent from raw diffs.
2. The receiving agent starts with `plan_state_resume` + the handoff record, then `journal_record` (`decision_point`) any deviation from the handed-off plan.
3. Handoffs go stale: run `handoff_lifecycle_sweep` periodically (or when a namespace feels cluttered) to expire abandoned handoffs, and treat a handoff older than the task's cadence as suspect — verify against current state before trusting it.

## 5. Cross-brain sync

- `bridge_sync` synchronizes memory across bridged brains/backends — use it when agents operate against different MemQ deployments that are bridged, before assuming their views agree.
- After a sweep or sync, re-run `plan_state_read` before acting; the claim picture may have changed.

## 6. Coordination etiquette

- One writer per plan at a time; everyone else reads. Contested claims get resolved by a human or by the older claim yielding via handoff — never by silently overwriting another agent's checkpoints.
- Every coordination write is namespace-scoped: confirm the shared namespace first (see the `team-sync` skill's alignment handshake).
- Record failures too: a `journal_record` with `type: "failure_record"` on a dead end saves the next agent from repeating it — that is the point of shared memory.
