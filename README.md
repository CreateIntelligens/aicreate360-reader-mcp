# aicreate360-reader-mcp

[![npm version](https://img.shields.io/npm/v/aicreate360-reader-mcp)](https://www.npmjs.com/package/aicreate360-reader-mcp)

An MCP server that lets AI agents fetch any public webpage and convert it to clean Markdown.

Powered by [aicreate360](https://www.aicreate360.com/en-US), it turns any URL into readable Markdown text — no manual copy-paste needed.

Works with:

- News sites, blogs, technical documentation
- GitHub pages, wikis
- Any publicly accessible webpage

> Some websites are protected by anti-scraping measures or require authentication. These sites cannot be fetched, and the tool will return an appropriate error message.

[中文版 README](./README.zh-TW.md)

## Quick Start (npx)

No installation required — run directly with `npx -y aicreate360-reader-mcp`:

```json
{
  "mcpServers": {
    "aicreate360": {
      "command": "npx",
      "args": ["-y", "aicreate360-reader-mcp"]
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

## Install via npm

```bash
npm i aicreate360-reader-mcp // in project
npm i -g aicreate360-reader-mcp // global
```

Then point your MCP client to the installed entry point:

```json
{
  "mcpServers": {
    "aicreate360": {
      "command": "npx",
      "args": ["-y", "aicreate360-reader-mcp"]
    }
  }
}
```

## Tool

This server exposes a single tool:

### `fetch_url`

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
