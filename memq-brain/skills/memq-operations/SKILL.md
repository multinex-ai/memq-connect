---
name: MemQ Brain
description: >
  Use this skill whenever Claude should operate with the MemQ hosted
  intelligence fabric. Covers persistent memory, cross-session recall,
  the Soul Journal, Brain Pathways (associative recall, episode replay,
  sleep consolidation, reinforcement, prediction), Mnemosyne context
  compression, and _commons governed shared knowledge.

  Trigger on: "remember this", "what did we decide", "save context",
  "recall from last session", "use MemQ", "brain discover", "load context
  from memory", "journal this", "commons search", "mnemosyne", "checkpoint",
  "reflect", "consolidate", "reunion", "namespace info", any request for
  cross-session continuity, or any time the memq MCP server is connected.
---

# MemQ Brain — Comprehensive Claude Skill

---

## 1. What MemQ Is (And What It Is Not)

MemQ is a **hosted shared-intelligence fabric**, not a vector database
with a nicer API. The critical differences:

- Every write goes to four layers simultaneously: Soul Journal (append-only
  JSONL), vector store (semantic embeddings), graph mirror (entity/temporal
  relationships and HOT bus), and hot stream (recency surface). There is no
  "just store a string" path — every write is multi-layered.
- Every read is **multi-channel fusion**: vector similarity, graph recall,
  hot bus recency, and journal text-match are all queried in parallel, then
  merged and ranked with bonuses. The result is not nearest-neighbour cosine
  — it is the most contextually relevant memory for the current namespace and
  task.
- **Deduplication is automatic.** Before any write lands, MemQ checks the
  content hash (exact match) and then the nearest vector neighbour against a
  similarity threshold. Duplicates increment the reinforcement counter instead
  of creating a new record. Claude must not call `add_memory` in a loop
  expecting all entries to persist separately.
- **Reflection triggers automatically.** After every N writes (configured on
  the server, typically 25–50, optionally jitter-seeded with quantum entropy)
  the system runs a background consolidation. Manual calls to `reflect_memory`
  or `brain_consolidate_sleep` are additive, not redundant.
- Namespaces are **tier-bound and identity-enforced** by the VISA/OAuth layer.
  Claude cannot see another tenant's data and cannot write to `_commons`
  directly through the hosted bridge.

---

## 2. Connection and Auth

**MCP endpoint:** `https://mcp.multinex.ai/mcp/v1`

**OAuth (interactive, default):** `mcp-remote@latest` will auto-discover the
OAuth server from the endpoint's `.well-known/oauth-protected-resource/mcp/v1`
metadata and redirect to `https://billing.multinex.ai` for the PKCE flow.
Complete once; the token is cached. OAuth tokens are prefixed `mnxoa_`.

**API key (CI / service accounts):**
Set `MEMQ_API_KEY_AUTH_HEADER=Bearer <key>` in the environment.
Get a key at `https://billing.multinex.ai/dashboard`.

**Legacy VISA token:** Pass `X-Munx-Visa-Token` header for compatibility
with older clients only.

---

## 3. Tier and Namespace Model

| Tier | Namespace access |
|------|-----------------|
| `FREE` | `_commons` only — no private namespace |
| `BASE` | `_commons` + exactly one private namespace |
| `VERIFIED` | `_commons` + one authenticated private namespace |
| `TEAM` | `_commons` + team/org namespace and approved subteam scopes |
| `INTERNAL` | Internal service access |
| `ROOT` | Operator/sovereign runtime access |

Rules that must never be violated:

- Private namespaces are locked. No other tenant can read them.
- `_commons` is governed shared knowledge, not a personal scratchpad.
- The hosted bridge cannot promote private memory into `_commons` directly.
  `commons_resonance` surfaces candidates; publication belongs to the core
  runtime governance path.
- `FREE` tier has no private write surface. All `add_memory` calls land in
  `_commons` scope only.

---

## 4. Session Opening Sequence (Always Run in Order)

```
1. reunion          — handshake, confirm protocol + auth posture + namespace
2. namespace_info   — verify active namespace, tier, journal footprint
3. mnemosyne_context (objective: "<current task>")
                    — hydrate HOT/WARM/COLD/ENGINE before deep work
4. (optional) brain_recall_episode or brain_associate
                    — only if the task depends on a prior session or known failure
```

Do not skip `reunion`. It returns the protocol version, deployment mode,
access level, billing posture, and namespace status. Everything after it
depends on knowing the scope.

Do not skip `mnemosyne_context`. It compresses recent episodic, semantic,
procedural, and checkpoint memory into a token-efficient pack. Running it
before reasoning avoids re-reading the entire journal.

For research tasks, shared operational questions, public-source synthesis,
or cross-team pattern lookup, call `commons_search` alongside private namespace
retrieval. `_commons` is the only shared readable namespace; use it for
governed reusable knowledge, never for private tenant implementation details.

---

## 5. Memory Types — What Each Is For

Every write to MemQ requires a `memory_type`. Choosing the wrong type
degrades retrieval because filters and replay selection are type-aware.

| Type | Purpose | When to use |
|------|---------|-------------|
| `episodic` | What happened, in sequence | Events, observations, decisions with temporal order |
| `semantic` | Abstract facts, rules, concepts | Verified facts, domain knowledge, distilled patterns |
| `procedural` | How to do something | Step sequences, call orders, workflows, protocols |
| `checkpoint` | Resumable state snapshot | End of phase, before risky operation, session boundary |
| `hybrid` | Combined bridge records | bridge_sync, reflection_handoff — set automatically |
| `reflection` | Consolidation output | Set by reflect_memory/brain_consolidate_sleep — do not set manually |

**Critical:** `reflection` memories are written by the system. Writing your
own text with `memory_type: "reflection"` does not trigger consolidation — it
just creates a record tagged as a reflection. Use `reflect_memory` or
`brain_consolidate_sleep` to trigger actual consolidation.

---

## 6. How Search and Retrieval Actually Work

Understanding the scoring model determines what you store and how you query.

### Write-time storage (all four layers simultaneously)
1. Content hash dedup check → if match, increment `reinforcement_count`, skip write
2. Nearest-vector dedup check against similarity threshold → if above threshold, increment reinforcement, skip write
3. New record: embed text → write to vector store + graph mirror + Soul Journal + hot bus

### Read-time fusion (`search_memory`, `query_memory`)
```
parallel fetch:
  vector store   → top_k * 3 candidates (cosine similarity)
  graph mirror   → top_k * 2 candidates (text + entity graph)
  hot bus        → top_k * 2 candidates (recency stream)

scoring bonuses applied to merged candidates:
  base score        = vector cosine similarity
  recency bonus     = +0.03 (flat)
  reinforcement     = +0.01 × reinforcement_count (max 0.10)
  temporal bonus    = +variable if temporal facts found in metadata
  graph overlap     = +0.18 added to existing score
  hot bus overlap   = +0.25 added to existing score

product boundary guard: silently drops off-topic candidates
final ranking: min-heap top-k selection
```

**Implications for how to write memories:**
- Frequently-relevant facts get reinforcement bonuses and rise in retrieval.
  Write the same concept under the same text regularly via `add_memory` to
  increase its weight — dedup promotes it rather than duplicating it.
- Recent memories win the hot bus bonus (+0.25). Checkpoint and journal
  writes that happen close to a query tend to surface first.
- Graph mirror adds entity context. `add_memory` with entity-rich text
  (product names, decision IDs, team names) gets better graph recall.

### `recent_memory` — hot bus first, journal fallback
Reads from the graph mirror hot stream first. Falls back to Soul Journal
`list_recent` when the hot bus has no records. Does **not** do semantic
search. Use it for temporal continuity ("what happened in this session"),
not for relevance ("what do I know about X").

### `hybrid_retrieve` (contract tool, if enabled)
Blends all sources with configurable `fusion_strategy`:
`balanced` | `memory_first` | `plan_first` | `temporal_first`
and configurable `sources` array:
`["search", "vector", "graph", "hot", "journal", "plan_state", "temporal"]`
Use when the standard `query_memory` is not surfacing enough signal across
different memory layers.

---

## 7. Tool Deep Reference

### 7.1 `add_memory`
Persist a memory into all four storage layers (journal, vector, graph, hot).

```json
{
  "text": "string (required, max ~12 000 bytes)",
  "agent_id": "string — identifies the caller agent (optional)",
  "memory_type": "episodic|semantic|procedural|checkpoint|hybrid",
  "task_id": "string|null — tie to a plan or task ID",
  "tags": ["string", ...] — up to 32, max 64 chars each,
  "metadata": {}
}
```

**Dedup behavior:** If the normalized text hash matches an existing record,
or if the nearest vector is above the similarity threshold, MemQ returns
`{ deduped: true, reason: "exact_content_hash_match"|"near_duplicate_similarity" }`
and increments `reinforcement_count` instead of creating a new record.

**Auto-reflect:** Every non-reflection write increments the auto-reflect
counter. When the threshold is reached (fixed or quantum-jittered) a
background `reflect_memory` fires automatically.

**When to call:**
- Persisting a verified decision with its rationale
- Recording a failure with its root cause (tag with `failure_record`)
- Saving a reusable procedure or pattern
- Writing a resumable checkpoint before a risky operation
- Do NOT call for transient scratchpad notes you will not need across sessions

---

### 7.2 `query_memory` / `search_memory`
Semantic + multi-channel search scoped to the authenticated private namespace.
`search_memory` is an alias — they are identical.

```json
{
  "query": "string (required, max ~4 000 bytes)",
  "top_k": 1–25 (default: server config, typically 5–10),
  "filters": {
    "agent_id": "string",
    "memory_type": "episodic|semantic|procedural|checkpoint|hybrid|reflection",
    "task_id": "string|null",
    "tags": ["string", ...]
  }
}
```

Returns `{ query, results: [...], channels: { vector_hits, graph_hits, hot_hits, temporal_hits } }`.

Each result row includes `score` (fused), `vector_similarity` (raw cosine),
`channels` (which layers contributed), `reinforcement_count`, and `created_at`.

**When to call:** Before any significant decision that prior knowledge could
change. Especially for: "have we solved this before?", "what is the current
state of X?", "are there known failure patterns for Y?".

---

### 7.3 `recent_memory`
Returns the most recent HOT-context memories by recency, not relevance.

```json
{
  "limit": 1–100,
  "filters": { "agent_id", "memory_type", "task_id", "tags" }
}
```

**When to call:** At session start when you need the current working set.
When continuing an interrupted task and need the last N actions.
Do NOT use it when you need relevance-ranked results — use `search_memory`.

---

### 7.4 `save_context`
Write a context fragment into Mnemosyne (same underlying path as `add_memory`
but framed for episodic/semantic/procedural/checkpoint context).

```json
{
  "content": "string (required)",
  "session_id": "string|null — tag to a session for episode replay",
  "task_id": "string|null",
  "tags": [...],
  "kind": "episodic|semantic|procedural|checkpoint",
  "observation": { ... },
  "metadata": {}
}
```

The `observation` object (see §8) enriches the context with actor identity,
outcome, reward signal, executive phase, and confidence.

**When to call:**
- Important state transitions during a task (not just the final outcome)
- When the task crosses a decision boundary
- Before a risky or irreversible operation (use `kind: "checkpoint"`)
- When persisting reasoning that shaped a choice

---

### 7.5 `reflect_memory`
Manually trigger self-reflection over the recent memory window.

```json
{
  "window": 10–500 (default: server config),
  "force": true|false — bypass the minimum-entries guard,
  "session_id": "string — scope to a specific session",
  "agent_id": "string — scope to a specific agent"
}
```

**What happens internally:**
1. Loads `window` recent records from graph mirror (or journal fallback)
2. Uses quantum-entropy or fixed replay selection to pick the best sources
3. Extracts failure patterns, procedures, and constraints from record text
4. Optionally runs AI synthesis (Cloudflare/custom model) for a narrative summary
5. Writes a new `reflection` memory tagged `["reflection", "learning", "checkpoint"]`
6. Links the reflection to source IDs in the graph mirror

**When to call:** After completing a significant milestone. After recovering
from a failure. Explicitly when `memory_status` shows the auto-reflect counter
is far below threshold and context is accumulating.

**Note:** If `window` < 8 and `force` is false, the reflection is skipped
and returns `{ status: "skipped", reason: "insufficient_context" }`.

---

### 7.6 `journal_record`
Write a typed Soul Journal entry for durable audit, learning, and replay.

```json
{
  "type": "decision_point|failure_record|reflection|checkpoint",
  "content": "string (required)",
  "session_id": "string|null",
  "task_id": "string|null",
  "tags": [...],
  "observation": { ... },
  "metadata": {}
}
```

Journal entries are **namespace-scoped** — entries from one namespace are not
visible when searching from another. The Soul Journal persists on durable
storage and is replayed from the vector store on Cloud Run restarts.

**Entry types and when to use each:**

| Type | Use when |
|------|---------|
| `decision_point` | A choice was made with alternatives and rationale |
| `failure_record` | An error, regression, or blocked operation occurred |
| `reflection` | End-of-session learning or a major milestone conclusion |
| `checkpoint` | Resumable state: what was done, what remains, current risk |

**When to call:** At every significant decision, failure, and milestone.
These entries feed `brain_reinforce`, `journal_distill`, and `reflect_memory`.
High-quality tagged journal entries are what make `brain_predict` accurate.

---

### 7.7 `journal_search`
Text search over the durable Soul Journal within the authenticated namespace.

```json
{
  "query": "string",
  "session_id": "string|null — filter to one session",
  "tag": "string — filter to one tag",
  "limit": 1–100
}
```

Returns entries sorted by `created_at` descending. Uses text-match scoring
(exact substring, then term overlap ratio) — not vector search.

**When to call:** When you know roughly what you logged but need to find the
exact entry. When searching for all entries from a prior session. When
filtering by a specific tag (e.g., all `failure_record` entries for a task).

---

### 7.8 `journal_distill`
Build SFT (supervised fine-tuning) records and reinforcement patterns from
the namespace journal history.

```json
{
  "session_id": "string|null",
  "tag_filter": "string",
  "limit": 1–250
}
```

Returns:
- `sft_records`: structured input/output pairs for learning
- `reinforcement_patterns`: signals tagged `reinforce` / `avoid` / `observe`
- `learning_profile`: dominant terms, session counts, memory-type distribution
- `token_savings` and `efficiency_metrics`

**When to call:** When preparing a learning summary after a long task.
When reviewing what patterns the namespace has accumulated. Not a routine
call — use it deliberately for learning-loop analysis.

---

### 7.9 `brain_discover`
Guided problem-solving: semantic search across Mnemosyne pathways, optionally
augmented by AI synthesis.

```json
{
  "objective": "string (required)",
  "problem_context": "string (optional, up to 8 000 bytes)",
  "top_k": 1–25,
  "include_ai_assist": true|false
}
```

Returns:
- `results`: relevant private memories for the objective
- When `include_ai_assist: true` and AI synthesis is configured:
  - `help_response`: narrative answer
  - `discovered_connections`: links between memories
  - `context_augments`: enriched context fragments
  - `suggested_queries`: follow-up MemQ queries
  - `next_actions`: proposed next steps
  - `risks`: identified risk signals

**When to call:** At the start of a complex task where prior work may exist.
Before designing an architecture or plan. When you need both retrieval *and*
interpretation rather than raw results.

---

### 7.10 `brain_associate`
Hippocampal-style associative recall — finds memories linked to a cue, a
memory ID, or a session via spreading activation.

```json
{
  "cue": "string — natural-language cue",
  "session_id": "string|null — seed from a session",
  "memory_id": "uuid — seed from a specific memory",
  "top_k": 1–25,
  "include_temporal": true|false
}
```

Returns:
- `focus`: the seed memories (matched by cue/session/id)
- `associations`: nearby memories ranked by `association_strength`
  (weighted combination of shared tags, cue text match, session bonus)
- `pathways.hippocampal_indexing`: how many seed memories anchored the recall
- `pathways.spreading_activation`: how many associations were found
- `pathways.dominant_terms`: top terms from the combined set

Minimum `association_strength` to appear in results: 0.15.

**When to call:** When you need the *context around* a known memory — not the
memory itself but what's semantically nearby. When a cue string yields too
few direct vector results. When tracing a failure pattern to related episodes.

---

### 7.11 `brain_recall_episode`
Replay an episodic thread in timeline order with optional related echoes.

```json
{
  "cue": "string",
  "session_id": "string|null",
  "limit": 1–50,
  "include_related": true|false
}
```

Returns:
- `timeline`: entries sorted by `created_at` ascending (oldest first)
- `gist`: dominant terms from the episode, normalized to 220 chars
- `token_load`: estimated token count for the episode
- `related_echoes`: entries from related sessions with ≥ 0.2 shared-tag overlap
  (only when `include_related: true`)

**When to call:** When you need to replay what happened in a session in order.
When debugging a regression by stepping through the sequence of events.
When a user asks "what did we do last time on X?".

---

### 7.12 `brain_consolidate_sleep`
Sleep-like memory consolidation — the most powerful compression tool in MemQ.

```json
{
  "session_id": "string|null",
  "agent_id": "string — filter to one agent",
  "tag_filter": "string",
  "limit": 8–250,
  "persist": true|false — write compressed memories back to the store,
  "include_commons_candidates": true|false
}
```

**What happens internally:**
1. Loads and filters journal entries for the namespace
2. Derives `semantic_abstractions` (concept → support count → memory refs)
3. Derives `procedural_rules` from procedural/reflection/checkpoint entries
4. Derives `observational_models` from observational-learning reinforcement patterns
5. Derives `executive_guardrails` from failure/recovery/reflection patterns
6. Derives `reward_priors` (reinforce / avoid signals)
7. Derives `social_priors` from the learning profile's top social contexts
8. When `persist: true`: writes a `semantic` memory and a `procedural` memory
   back to the store, then triggers `reflect_memory`
9. Reports compression ratio: `raw_token_estimate` → `compressed_token_estimate`
   → `tokens_saved_estimate` → `savings_ratio` → `compression_factor`
10. When `include_commons_candidates: true`: surfaces patterns with ≥ 2 supporting
    sessions as promotion candidates (review-only — does not write to `_commons`)

**When to call:**
- At the end of a long session (milestone completion, major bug resolved)
- Before token pressure forces context truncation
- When you want to extract reusable rules from a messy session
- With `persist: true` when the compressed knowledge should survive the session

---

### 7.13 `brain_reinforce`
Distill the journal history into reinforcement patterns and optionally
trigger a reflection pass.

```json
{
  "session_id": "string|null",
  "agent_id": "string",
  "tag_filter": "string",
  "limit": 1–250,
  "trigger_reflection": true|false
}
```

Builds `reinforcement_patterns` from journal entries tagged or typed with
reward signals (`reinforce` / `avoid` / `observe`). The patterns feed
`brain_predict` and the Dreamer cycle.

**When to call:** After meaningful work that produced visible outcomes —
both successes and failures. After fixing a bug, completing a refactor,
or resolving a blocked task.

---

### 7.14 `brain_predict`
Forecast next actions, risk signals, and corrective guardrails from recent
memory and reinforcement history.

```json
{
  "objective": "string",
  "session_id": "string|null",
  "limit": 4–100
}
```

Returns:
- `next_actions`: up to 4 predictions derived from recent successes,
  observational models, and dominant terms
- `risk_forecast`: up to 4 risk signals from recent `avoid` reinforcement patterns
  with suggested mitigations
- `predictive_terms`: top terms driving the forecast
- `confidence`: 0–0.95 (higher with more reinforcement history)

**When to call:** Before starting a complex multi-step task. When estimating
risk before a deployment. As a pre-flight check when resuming after interruption.

---

### 7.15 `mnemosyne_context`
Return a compressed HOT/WARM/COLD/ENGINE context pack for the namespace.

```json
{
  "objective": "string — current task objective",
  "include_recent": true|false,
  "include_learning": true|false,
  "include_working_memory": true|false,
  "limit": 1–20
}
```

The four context tiers:
- **HOT** — most recent activity, current task state
- **WARM** — vector/semantic search results relevant to the objective
- **COLD** — episodic and graph relationships
- **ENGINE** — orchestration workflow state machine context

**When to call:** At session start after `reunion` and `namespace_info`.
Any time token pressure rises and you need to compress context rather than
re-reading entire transcripts. Before any long reasoning chain.

---

### 7.16 `commons_search`
Search the shared `_commons` knowledge pool explicitly.

```json
{
  "query": "string (required)",
  "top_k": 1–25,
  "filters": { ... }
}
```

`_commons` is the governed shared-intelligence layer. Content reaches it
only through approved promotion paths, not direct writes from the hosted
bridge. Use this for reusable patterns, cross-team knowledge, and world-sense
intelligence ingested by Nexus Ranger.

**When to call:** When shared procedures, known-good patterns, or team
knowledge could affect the current task. After `search_memory` when private
namespace results are insufficient.

---

### 7.17 `commons_resonance`
Surface `_commons` promotion candidates from the namespace journal without
bypassing governance.

```json
{
  "objective": "string",
  "tag_filter": "string",
  "limit": 4–100,
  "min_support": 2–10
}
```

Returns concepts with `min_support` supporting sessions as promotion candidates.
Also returns `hive_signal_terms` and `learning_profile`.

**This is a candidate surface, not a publish path.** Governance note is
included in every candidate: publication belongs to the core runtime.

**When to call:** When reviewing session-accumulated knowledge that might
benefit the wider team. When preparing a commons contribution request.

---

### 7.18 `commons_promotion_status`
Read recent hosted `_commons` promotion decisions.

```json
{
  "limit": 1–100,
  "offset": 0–10000
}
```

Shows which candidate promotions were accepted, pending, or rejected.
Does not expose raw private candidate text.

---

### 7.19 `commons_retract`
Admin-only: retract a bad memory from `_commons` with a tombstone ledger entry.

```json
{
  "id": "uuid (required)",
  "reason": "string (required, min 8 chars)",
  "requested_by": "string",
  "dry_run": true|false,
  "include_text": true|false
}
```

Only callable by operators with `ROOT` or `INTERNAL` tier. Use `dry_run: true`
to verify the target before committing.

---

### 7.20 `reunion`
Handshake with the hosted MemQ runtime.

```json
{
  "session_id": "string|null",
  "posture": "string — optional description of current task posture",
  "include_status": true|false
}
```

Returns: protocol version, auth posture, deployment mode, namespace, tier,
billing status, and access boundaries. Always the first tool called in a session.

---

### 7.21 `health_check`
Aggregate health status from all MemQ backend layers.

Returns `{ status: "ok"|"degraded", vectorStore, graphMirror }`.

Call after a connection error, before a write-heavy task, or when a prior
call returned unexpected results.

---

### 7.22 `memory_status`
Full system telemetry, tier configuration, quota state, and auto-reflection status.

Returns:
- backend health
- `config`: vector_dim, auto_reflect_every, replay_selection_mode, top_k_default,
  similarity_dedup_threshold, max_memory_text_bytes, max_query_bytes
- `tiers`: hot/semantic/journal surface mapping
- `vector_topology`, `graph_topology`, `slice_runtime`, `quantum_entropy`
- `auto_reflection`: strategy, threshold, writes_since_last_reflection,
  writes_until_next_reflection, pending
- `replay_policy`: mode, max_sources, tie_epsilon, last_selection diagnostics
- `rollout_contract`: declared and exposed contract tool names

**When to call:** When debugging unexpected retrieval quality. When checking
quota before a write-heavy task. When you need to know how many writes until
the next auto-reflection fires.

---

### 7.23 `namespace_info`
Describe the authenticated namespace boundary, billing posture, and journal footprint.

```json
{ "include_examples": true|false }
```

Returns: namespace name, tier, plan, access boundary, journal entry counts
by memory type, latest entry timestamp, and optionally 3 example entries.

---

### 7.24 `slicer_slice`
Chunk large text artifacts into semantic segments optimized for MemQ ingestion.

```json
{
  "text": "string (required)",
  "strategy": "semantic|fixed|paragraph"
}
```

Use this before calling `add_memory` with text that exceeds 6 000 bytes.
`semantic` preserves meaning boundaries; `fixed` is uniform; `paragraph`
splits on blank lines.

---

## 8. Observation Schema (for `journal_record` and `save_context`)

When writing journal entries or context saves that involve agent actions
or human decisions, attach an `observation` object. This feeds the
observational learning models in `brain_consolidate_sleep` and `brain_predict`.

```json
{
  "mode": "self|other_agent|human|external_system",
  "actor_id": "string — who performed the action",
  "action": "string — what was done",
  "outcome": "success|failure|mixed|unknown",
  "reward_signal": "reinforce|avoid|observe",
  "social_context": "peer|mentor|swarm|operator|external",
  "executive_phase": "perceive|plan|execute|reflect|checkpoint|resume",
  "confidence": 0.0–1.0
}
```

Field guidance:
- `reward_signal: "reinforce"` — this worked, repeat in similar conditions
- `reward_signal: "avoid"` — this failed or produced harm, avoid in future
- `reward_signal: "observe"` — neutral, log for learning without judgment
- `executive_phase` maps to the current stage in the PERCEIVE → PLAN →
  EXECUTE → REFLECT → CHECKPOINT → RESUME lifecycle

---

## 9. Operating Constitution

These rules are non-negotiable. Violating them produces degraded memory
quality, quota waste, or namespace boundary violations.

1. **Session start: run the opening sequence.** `reunion` → `namespace_info`
   → `mnemosyne_context`. Every time, without exception.

2. **Read before deciding.** Call `recent_memory` or `search_memory` before
   any decision where prior context could change the outcome. The answer
   "nothing relevant found" is still useful information.

3. **Search commons when work touches shared knowledge.** Use `commons_search`
   before designing any architecture, API contract, or cross-team workflow.
   Commons may already contain the answer.

4. **Write only useful outcomes.** Do not dump raw transcripts. Persist:
   - decisions with rationale
   - verified facts
   - reusable procedures
   - failure root causes with symptoms
   - resumable checkpoints
   - confirmed patterns

5. **Tag everything consistently.** Tags are the primary filter surface.
   Inconsistent tagging breaks `journal_search`, `brain_reinforce`,
   and replay selection. See §10 for canonical tag taxonomy.

6. **Namespace boundaries are hard.** Private memory is private. `_commons`
   is governed. Never store private data (keys, PII, credentials) in MemQ.
   Never claim commons publication happened through the hosted bridge.

7. **Audit events are not consumed usage.** Blocked calls, quota denials,
   dead-letter retries, and rate limit rejections should be recorded via
   `journal_record` with `type: "failure_record"`. They are audit facts.

8. **Degrade gracefully.** When `health_check` or `reunion` indicates
   degraded backends, note degraded mode, continue with local context,
   and retry at the next material decision point. Do not fail the session.

9. **Close sessions.** Always run the closing sequence. Memory without
   consolidation is ephemeral.

---

## 10. Tag Taxonomy

Use these canonical tags for consistent retrieval and replay selection:

**Product tags (Multinex repo):**
`memq`, `aieges-shield`, `billing-manager`, `marketing-platform`,
`munx-cli`, `legion`, `mars`, `forge`, `sentinel-kms`, `cloudgaze`,
`claw`, `vision`, `zonarosa`, `models`, `legion-mcp`, `commons-explorer`

**Task type tags:**
`migration`, `bugfix`, `feature`, `deployment`, `architecture`, `test`, `refactor`

**Severity tags:**
`critical`, `standard`, `minor`

**Lifecycle tags:**
`decision_point`, `failure_record`, `checkpoint`, `sleep_consolidation`,
`semantic_abstraction`, `procedural_rule`, `bridge_sync`, `plan_state`,
`reflection_handoff`, `reunion`

**Event category tags (for quota/audit classification):**
`system`, `memory_read`, `memory_write`, `commons`, `slicer`,
`graph_query`, `vector_translation`, `inference`, `quota_block`, `queue_audit`

---

## 11. Session Patterns

### 11.1 New task in a continuing project
```
reunion
namespace_info
mnemosyne_context (objective: "<task name>")
search_memory (query: "<relevant aspect>")
commons_search (query: "<shared pattern if applicable>")
→ begin work
journal_record (type: "decision_point", key decisions as they happen)
save_context (kind: "checkpoint", at phase boundaries)
→ complete work
brain_reinforce
brain_consolidate_sleep (persist: true)
save_context (kind: "checkpoint", final state summary)
```

### 11.2 Resuming after interruption
```
reunion
namespace_info
recent_memory (limit: 20)
brain_recall_episode (session_id: "<prior session>", include_related: true)
mnemosyne_context (objective: "<resumption task>")
→ continue from checkpoint
```

### 11.3 Debugging a regression
```
reunion
namespace_info
journal_search (query: "<error or component>", tag: "failure_record")
brain_associate (cue: "<error message or component>", top_k: 10)
search_memory (query: "<related system>", filters: { memory_type: "procedural" })
commons_search (query: "<known patterns for this class of failure>")
→ root cause analysis
journal_record (type: "failure_record", content: root cause + resolution)
brain_reinforce (trigger_reflection: true)
```

### 11.4 Long session at token pressure
```
mnemosyne_context (objective: "<current objective>")   ← replaces transcript re-read
save_context (kind: "checkpoint")                       ← persist current state
→ continue with compressed context
brain_consolidate_sleep (persist: true)                 ← at milestone boundary
```

### 11.5 Session closing sequence (always)
```
brain_reinforce (trigger_reflection: false)
brain_consolidate_sleep (limit: 100, persist: true, include_commons_candidates: true)
save_context (kind: "checkpoint", content: compact summary of what changed,
              what was verified, what remains uncertain, key risk)
```

---

## 12. Tool Selection Decision Tree

```
Do I need to START a session?
  → reunion → namespace_info → mnemosyne_context

Do I need RECENT activity (what just happened)?
  → recent_memory

Do I need RELEVANT knowledge (what do I know about X)?
  → search_memory / query_memory (private)
  → commons_search (shared)
  → brain_discover (with AI synthesis)

Do I need to TRACE context around a known memory or cue?
  → brain_associate

Do I need to REPLAY a session timeline in order?
  → brain_recall_episode

Do I need COMPRESSED context to save tokens?
  → mnemosyne_context

Do I need to WRITE a decision, fact, or failure?
  → add_memory (for vector/graph/hot retrieval)
  → save_context (for episodic/checkpoint framing with observation)
  → journal_record (for typed Soul Journal with audit trail)

Do I need to REFLECT and consolidate at a session boundary?
  → brain_consolidate_sleep (with persist: true)
  → brain_reinforce
  → reflect_memory (for a targeted reflection pass)

Do I need to PREDICT next actions or risks?
  → brain_predict

Do I need to see PROMOTION CANDIDATES for _commons?
  → commons_resonance
  → commons_promotion_status

Do I need to CHECK system health or quota?
  → health_check
  → memory_status

Do I need to VERIFY namespace and tier?
  → namespace_info

Do I need to CHUNK a large document?
  → slicer_slice (before add_memory)
```

---

## 13. Quota Awareness

The server enforces: monthly write quota, monthly read quota, write rate
(per-minute), read rate (per-minute), concurrent sessions, and max memory
segments. All are tier-dependent.

**On quota rejection (HTTP 429 / MCP error):**
1. Record the block via `journal_record` (type: `failure_record`,
   tag: `quota_block`) — this does not consume quota.
2. Back off and retry at the next material decision point.
3. Call `memory_status` to check writes_until_next_reflection and
   remaining monthly budget.
4. If quota is persistently exhausted, direct the user to
   `https://billing.multinex.ai/dashboard/settings?product=memq`.

**Tools classified as writes** (count against write quota):
`add_memory`, `journal_record`, `save_context`, `brain_consolidate_sleep`,
`brain_reinforce`, `reflect_memory`, `commons_retract`, `plan_state_write`,
`plan_state_checkpoint`, `bridge_sync`, `reflection_handoff`

**Tools classified as system** (do not count against read/write quota):
`health_check`, `memory_status`, `namespace_info`, `reunion`

All other tools count as reads.

---

## 14. Limits Reference

| Parameter | Limit |
|-----------|-------|
| `text` / `content` in write tools | ~12 000 bytes |
| `query` in search tools | ~4 000 bytes |
| `top_k` | 1–25 |
| `tags` per record | up to 32, max 64 chars each |
| `limit` in `recent_memory` | 1–100 |
| `limit` in `brain_consolidate_sleep` | 8–250 |
| `limit` in `journal_distill` | 1–250 |
| `window` in `reflect_memory` | 10–500 |
| Reflection minimum entries (without force) | 8 |

---

## 15. Signup and Docs

- Free account: `https://billing.multinex.ai/signup?product=memq`
- Dashboard + API keys: `https://billing.multinex.ai/dashboard`
- MCP endpoint: `https://mcp.multinex.ai/mcp/v1`
- OAuth discovery: `https://billing.multinex.ai/.well-known/oauth-authorization-server`
- Protected resource metadata: `https://mcp.multinex.ai/.well-known/oauth-protected-resource/mcp/v1`
- Status: `https://status.multinex.ai`
