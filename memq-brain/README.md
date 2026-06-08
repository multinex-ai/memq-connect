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

The hosted endpoint is:

- `https://mcp.multinex.ai/mcp/v1`
