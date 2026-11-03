# MemQ — one shared memory for your AI agents

MemQ is a plug-and-play MCP connection with skills for remembering project decisions, resuming work across sessions, and handing context to teammates. Compatible agents can use the same authorized memory instead of building a separate history in every tool.

## Connect

1. [Create a MemQ account](https://billing.multinex.ai/signup).
2. Install the plugin or add the remote MCP endpoint below in your client's connector settings.
3. Complete the client's OAuth sign-in with MemQ.
4. Ask: **Connect MemQ and verify my workspace before recalling any memory.**

Remote MCP endpoint: `https://mcp.multinex.ai/mcp/v1`

### Claude Code repository marketplace

```text
/plugin marketplace add multinex-ai/memq-connect
/plugin install memq-brain@multinex-memq
```

### Codex repository marketplace

```sh
codex plugin marketplace add multinex-ai/memq-connect
codex plugin add memq-brain@multinex-memq
```

Then choose **MemQ / memq-brain** in the client's plugin browser. This repository marketplace is separate from a reviewed public directory listing. The release ZIP contains a portable plugin for clients that support manual installation; ChatGPT's public listing requires OpenAI review.

## Useful prompts

- Resume my project from its latest verified checkpoint.
- Save the decisions and next steps from this task for my next session.
- Prepare an authorized teammate handoff with evidence and unresolved questions.
- Recall the last verified fix for this failure before trying it again.

## What is included

Five skills cover connection and identity checks, bounded recall/checkpoints, learning from verified outcomes, team sharing, and multi-agent coordination. The plugin uses the hosted HTTPS endpoint directly: no npm package, local executable, install hook, or bundled server is required.

## Data and permissions

Selected tool arguments and retrieved context travel between your MCP client and the hosted MemQ service. This is a cloud connection, not a promise that data stays on your machine. Use your own OAuth sign-in; access follows the authenticated workspace. Only save selected, authorized project context. Do not store credentials or raw transcripts. Sharing across organizations requires separate authorization.

[Privacy policy](https://multinex.ai/privacy) · [Terms](https://multinex.ai/terms) · [Plans and pricing](https://multinex.ai/memq/pricing) · [Support](mailto:support@multinex.ai)

Memory retrieval can be incomplete or stale. Cross-model access does not guarantee identical retrieval, lossless vector conversion, or identical model behavior. See [published evaluation scope and methodology](https://multinex.ai/benchmarks/memq) for evidence and limits. Reflection skills retain verified lessons; they do not guarantee model-weight training.

## Distribution status

MemQ is active in the official MCP Registry as **ai.multinex/memq**, version **2.8.1** (verified November 3, 2026). Claude and OpenAI directory submission status is tracked in [the distribution checklist](https://github.com/multinex-ai/memq-connect/blob/main/docs/DISTRIBUTION.md). An installable repository or release does not imply directory approval.

## License

These public connector manifests and skills use the repository's existing MIT license. The hosted MemQ service is separate and governed by its service terms. This repository does not contain or relicense private server source.
