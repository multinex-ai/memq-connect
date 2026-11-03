---
name: reunion-first
description: "Connect MemQ and verify the authenticated workspace before recalling project context or resuming earlier work."
---

# Connect and resume with MemQ

Use the client's supported connection and OAuth sign-in for https://mcp.multinex.ai/mcp/v1. A MemQ account is available at https://billing.multinex.ai/signup. Never request secrets in conversation, copy another client's credentials, or change account routing to make a connection work.

1. Resolve the intended project, repository ownership, and user-selected organization. Preserve host and project account-routing rules.
2. Discover the actual MemQ tools and schemas. Call the exposed identity handshake, typically reunion and namespace_info. Verify the service, authenticated principal, effective namespace, and authoritative organization binding. A URL or connection label alone is insufficient.
3. If identity is missing, mismatched, or ambiguous, stop private reads and writes. Explain the missing check and continue unrelated local work.
4. Once verified, retrieve one relevant checkpoint or a small set of task-specific memories. Check volatile facts against current source or service evidence before acting.
5. Report the connected scope and what was actually recalled. Installation alone does not establish a working connection.

Do not invent a namespace or override one to force a match. Recheck scope when changing projects. Do not automatically save setup data or import transcripts.
