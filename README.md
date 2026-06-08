# MemQ — Connect

Public distribution surface for **Multinex MemQ**, a hosted sovereign memory layer
for AI agents, served over the Model Context Protocol.

This repository contains only distribution metadata — the MCP Registry manifest, the
Claude Code plugin, and usage docs. MemQ runs as a hosted service; there is no server
source here.

- **Product:** https://multinex.ai/memq
- **Sign up (15-day free trial):** https://billing.multinex.ai/signup
- **MCP endpoint:** `https://mcp.multinex.ai/mcp/v1`
- **Usage guide:** [docs/MULTI_AGENT_USAGE_GUIDE.md](docs/MULTI_AGENT_USAGE_GUIDE.md)

## Install the Claude Code plugin

```
/plugin marketplace add multinex-ai/memq-connect
/plugin install memq-brain@multinex-memq
```

Then create an account at the signup link and let Claude Code complete the OAuth flow
against `billing.multinex.ai`. Start each working session with `reunion`.

## Use as a raw MCP server

Point any MCP client at the hosted endpoint with `mcp-remote`:

```jsonc
{
  "memq": {
    "command": "npx",
    "args": ["-y", "mcp-remote@latest", "https://mcp.multinex.ai/mcp/v1"],
    "env": { "MEMQ_API_KEY_AUTH_HEADER": "Bearer <your-memq-key>" }
  }
}
```

OAuth-capable clients can omit the key and authenticate interactively (discovery at
`https://billing.multinex.ai/.well-known/oauth-authorization-server`).

## MCP Registry

Published as `ai.multinex/memq` (see [`server.json`](server.json)).

## License

See [LICENSE](LICENSE). MemQ is a hosted commercial service; the manifests and skills
here are provided to enable connection to it.
