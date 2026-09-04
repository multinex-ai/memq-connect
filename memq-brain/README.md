# MemQ Brain Plugin

Claude Code plugin for the hosted Multinex MemQ brain.

This plugin installs the hosted MemQ MCP connection and adds skills for:

- REUNION-first startup
- Mnemosyne context hydration
- episodic and associative recall
- checkpointed context saves
- reflective learning loops

Billing and connection:

1. Create the hosted MemQ account at `https://billing.multinex.ai/signup`
2. Install the plugin from the Multinex marketplace
3. Let Claude Code complete the OAuth flow against `billing.multinex.ai`
4. Start each working session with `reunion`

Claude Code connects directly over hosted HTTP and performs OAuth discovery
itself. The plugin does not run npm, npx, package managers, local executables,
or downloaded bridge software.

Privacy boundary:

- MemQ receives only explicit MCP tool arguments selected for a MemQ operation.
- Do not dump or store raw transcripts.
- Only persist the context explicitly selected for durable recall.
- Unrelated conversation content must remain in Claude Code and must never be
  copied into a MemQ write call.

The hosted endpoint is:

- `https://mcp.multinex.ai/mcp/v1`
