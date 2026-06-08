---
description: Start every Claude Code session with a REUNION handshake, namespace discovery, Mnemosyne hydration, and checkpointed write-back into MemQ.
---

Use this skill whenever Claude Code is operating with the hosted MemQ plugin.

Session opening sequence:

1. Call `reunion` first.
2. Call `namespace_info` to confirm the active namespace, plan, and access boundary.
3. Call `mnemosyne_context` with the current objective to hydrate HOT, WARM, COLD, and ENGINE context before deep work starts.
4. If the task depends on prior failures or decisions, call `brain_recall_episode` or `brain_associate`.

Execution pattern:

- Use `save_context` for important state transitions, not just the final outcome.
- Use `journal_record` for decisions, failures, reflections, and checkpoints.
- Prefer structured tags that make later replay useful.
- Keep context economical: persist compressed checkpoints and explicit outcomes instead of dumping raw transcripts.

Session closing sequence:

1. `brain_reinforce` after meaningful work or visible outcomes.
2. `brain_consolidate_sleep` after long sessions or milestone boundaries.
3. `save_context` with a compact checkpoint that lets the next session resume quickly.

Boundary rules:

- Hosted MemQ is the brain and learning surface.
- `_commons` publication still belongs to the governed core runtime.
- Do not claim cross-namespace commons promotion is happening automatically from the hosted bridge.
