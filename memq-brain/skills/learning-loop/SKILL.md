---
description: Run MemQ as a learning loop: observe, encode, replay, reinforce, consolidate, and resume without losing context.
---

Use this skill for long-running coding, research, debugging, or operator sessions where Claude Code should improve over time.

Model the session as five pathways:

1. Observe
   - `journal_record` with observation metadata
   - capture who acted, what happened, the outcome, and the executive phase

2. Encode
   - `save_context` for durable episodic, semantic, procedural, or checkpoint memory
   - use tags that reflect task, subsystem, and outcome

3. Replay
   - `brain_recall_episode` for ordered timeline recall
   - `brain_associate` for spread activation around a cue or failure pattern

4. Reinforce
   - `brain_reinforce` after success, failure, or a mixed result
   - use this to convert raw traces into actionable reinforcement patterns

5. Consolidate
   - `brain_consolidate_sleep` at milestone boundaries to compress context and surface reusable patterns

When token pressure rises:

- call `mnemosyne_context` instead of rehydrating entire transcripts
- save a compact checkpoint with `save_context`
- keep one current objective, one active plan, and one current risk summary in working memory

The point of this loop is not “store everything.”
The point is to preserve what changes future decisions.
