# AICreate360 Content MCP Server

[![CI](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/CreateIntelligens/aicreate360-mcp/actions/workflows/CI.yml)

## Overview

One MCP server, three live Taiwanese content sources, zero manual copy-paste.

This server lets Codex read the latest content from:

- [三立新聞網](https://setn.com): breaking news and headline feeds
- [中天電視](https://www.ctitv.com.tw): programs, anchors, announcements, ethics, and complaint records
- [三立嚴選](https://bestshop.setddg.com): categories, products, and prices

If you want Codex to answer questions like:

- `列出三立新聞網熱門最新 10 則新聞`
- `找出中天電視有哪些主播`
- `列出三立嚴選美食分類最熱銷的 5 個產品跟價格`

this MCP is built for that workflow.

Source aliases are normalized automatically. For example:

- `setn`, `SETN`, `三立新聞網`, `三立新聞` -> `setn`
- `ctitv`, `CTITV`, `中天電視`, `中天新聞網`, `中天` -> `ctitv`
- `bestshop`, `Bestshop`, `三立嚴選`, `嚴選` -> `bestshop`

## Install

This project is currently installed from source.

```bash
git clone https://github.com/CreateIntelligens/aicreate360-mcp.git
cd aicreate360-mcp
pnpm install
pnpm build
```

After build, the MCP entrypoint is:

```bash
node dist/index.js
```

## Enable In OpenAI Codex CLI

Recommended:

You have to check and add project path in your machine

```bash
codex mcp add aicreate360-content -- node "[your-project-path]/dist/index.js"
```

Then verify:

```bash
codex mcp list
```

If you prefer manual configuration, add this to `~/.codex/config.toml`:

```toml
[mcp_servers.aicreate360-content]
command = "node"
args = ["/absolute/path/from-your-machine/to/aicreate360-mcp/dist/index.js"]
```

Generate the path from the project root instead of copying someone else's local path:

```bash
pwd
```

## Enable In OpenAI Codex Desktop

Based on OpenAI's Codex documentation, Codex Desktop uses the shared Codex MCP configuration used by Codex CLI. In practice, the simplest path is:

1. Add the server once with `codex mcp add ...`
2. Restart Codex Desktop
3. Open a new Codex session and use the server

If you manage MCP servers manually, use the same `~/.codex/config.toml` block shown above, then restart Codex Desktop.

## What This MCP Exposes

Current tools:

- `aicreate360_list_sources`
  Lists supported sources and their capabilities.
- `aicreate360_list_items`
  Fetches the latest upstream content and returns normalized, paginated items.
- `aicreate360_get_item`
  Re-fetches the latest upstream content and resolves a specific item by URL.

## Notes

- This server fetches live data on every request.
- It depends on these AICreate360 reader endpoints remaining available:
  - `https:/setn.com`
  - `https://www.ctitv.com.tw`
  - `https://bestshop.setddg.com`
- Runtime requires Node latest LTS and pnpm@latest.
