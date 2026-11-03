---
name: team-sync
description: "Align authorized teammates around a shared MemQ project memory and hand off selected decisions without copying private conversations."
---

# Share project context with teammates

Each teammate uses their own supported OAuth sign-in. Resolve the project and verify each agent's authenticated identity, organization binding, and effective namespace before assuming memory is shared. Do not exchange access tokens or invent namespace overrides.

Compare the returned scope identifiers. If they differ, stop shared reads/writes and explain the mismatch; do not broaden permissions as a workaround.

Within an authorized shared scope, recall the relevant task checkpoint and current decisions. Save selected facts, accepted decisions, evidence links, owners, and next steps only when shared visibility is authorized. Conversation transcripts, credentials, unrelated projects, and private scratch notes do not belong in a team handoff.

For a handoff, identify the intended team/task and include what is complete, what remains uncertain, and the next concrete action. Check the write receipt and let the receiving agent verify current artifacts before continuing.

Same-team collaboration is distinct from cross-organization disclosure. Cross-realm transfer needs a specific authorized destination, purpose, and data scope; this skill does not grant it. Do not trigger bridge synchronization or public commons promotion as routine housekeeping.
