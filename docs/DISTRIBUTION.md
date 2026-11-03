# MemQ distribution status

Snapshot: November 3, 2026.

| Channel | State | Evidence / next action |
|---|---|---|
| Official MCP Registry | Active: 2.8.1 | https://registry.modelcontextprotocol.io/v0.1/servers/ai.multinex%2Fmemq/versions/latest |
| Public GitHub repository marketplace | Version 1.3.0 prepared | Run node scripts/validate.mjs; release ZIP after validation |
| Claude directory: connector and plugin | Not submitted in this revision | Publisher sign-in, connector tests, populated reviewer account, portal checks, terms, and review required |
| OpenAI directory: ChatGPT and Codex | Not submitted in this revision | Verified publishing identity selection, ZIP upload, domain verification, OAuth/tool checks, and review required |

## Submission inputs

- Repository: https://github.com/multinex-ai/memq-connect
- Plugin folder: memq-brain; branch: main
- Name: MemQ; version: 1.3.0
- MCP URL: https://mcp.multinex.ai/mcp/v1
- OAuth discovery: https://billing.multinex.ai/.well-known/oauth-authorization-server
- Support: support@multinex.ai
- Privacy: https://multinex.ai/privacy
- Terms: https://multinex.ai/terms
- Brand assets: memq-brain/assets

Do not claim a directory listing before its public approval is verified. Do not attest that every tool was tested in a target client until those tests were actually completed. Reviewer credentials belong in the portal's protected fields, never in this repository or ZIP.

## Release procedure

Run node scripts/validate.mjs, then node scripts/package.mjs. The ZIP contains only the explicit public connector manifest, skills, documentation, license, and brand assets. No private backend code, credentials, lifecycle hooks, or API keys are included.

## Validation receipt

- Claude CLI: plugin and repository marketplace validation pass.
- All five skills: skill-creator frontmatter/naming validation passes.
- Portable plugin manifest: Agent Plugins 1.0.0 schema passes.
- Portable MCP core: Agent Plugins 1.0.0 schema passes when the documented OpenAI auth extension is evaluated separately. The published base schema currently rejects a server-level `extensions` field even though OpenAI's current build guide requires that location for OAuth configuration; full OpenAI portal validation remains required.
- Local package checks: referenced plugins/assets, consistent versions, OAuth configuration, skill names, and credential-like file checks pass.
- These checks do not establish a successful OAuth round trip or every-tool execution in Claude, ChatGPT, or Codex. Those remain submission gates.
