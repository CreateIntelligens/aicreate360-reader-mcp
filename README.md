# aicreate360

[![CI](https://github.com/CreateIntelligens/aicreate360-reader-mcp/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/CreateIntelligens/aicreate360-reader-mcp/actions/workflows/CI.yml)
[![npm version](https://img.shields.io/npm/v/aicreate360)](https://www.npmjs.com/package/aicreate360)

An MCP server that lets AI agents fetch any public webpage and convert it to clean Markdown.

Powered by [create360.ai](https://create360.ai), it turns any URL into readable Markdown text — no manual copy-paste needed.

Works with:

- News sites, blogs, technical documentation
- GitHub pages, wikis
- Any publicly accessible webpage

> Some websites are protected by anti-scraping measures or require authentication. These sites cannot be fetched, and the tool will return an appropriate error message.

[中文版 README](./README.zh-TW.md)

## Quick Start (npx)

No installation required — run directly with `npx`:

```json
{
  "mcpServers": {
    "aicreate360": {
      "command": "npx",
      "args": ["-y", "aicreate360"]
    }
  }
}
```

Add this to your MCP client config:

| Client         | Config path                     |
| -------------- | ------------------------------- |
| Claude Code    | `~/.claude.json` or `.mcp.json` |
| Claude Desktop | `claude_desktop_config.json`    |
| Gemini CLI     | `~/.gemini/settings.json`       |

## Install from Source

```bash
git clone https://github.com/CreateIntelligens/aicreate360-reader-mcp.git
cd aicreate360-reader-mcp
pnpm install
pnpm build
```

Then point your MCP client to the built entry point:

```json
{
  "mcpServers": {
    "aicreate360": {
      "command": "node",
      "args": ["/absolute/path/to/aicreate360-reader-mcp/dist/index.js"]
    }
  }
}
```

## Tool

This server exposes a single tool:

### `aicreate360_fetch_url`

Fetch any public URL and return its content as clean Markdown.

| Parameter | Type           | Description             |
| --------- | -------------- | ----------------------- |
| `url`     | `string` (URL) | The public URL to fetch |

Returns: Clean Markdown text.

### Usage Examples

- `Fetch the top 10 trending news from setn.com`
- `Convert this technical doc to Markdown: https://docs.github.com/en/rest`
- `Analyze this blog post: https://blog.example.com/post/1`

## Notes

- Each request fetches in real time — no caching.
- Depends on [create360.ai](https://create360.ai) service availability.
- No authentication required.
- Anti-scraping protected sites will return an error message.
- Requires Node.js >= 24.

## License

[MIT](./LICENSE)
