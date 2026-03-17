# AICreate360 Reader MCP Server

[![CI](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/CreateIntelligens/aicreate360-mcp/actions/workflows/CI.yml)

## Overview

一個 MCP server，讓 AI 代理可以擷取任何公開網頁內容並轉換為乾淨的 Markdown。

透過 [create360.ai](https://create360.ai) 服務，將任意 URL 的網頁內容轉為可讀的 Markdown 純文字，無需手動複製貼上。

適用於：

- 新聞網站、部落格、技術文件
- GitHub 頁面、Wiki
- 任何公開可存取的網頁

使用範例：

- `幫我看這個網址的內容 https://example.com`
- `抓這個頁面的重點 https://docs.example.com/guide`
- `把這個網頁轉成 markdown`

> 部分網站受反爬蟲保護或需要驗證，這些網站將無法擷取內容，工具會回傳對應的錯誤訊息。

## Install

```bash
git clone https://github.com/CreateIntelligens/aicreate360-mcp.git
cd aicreate360-mcp
pnpm install
pnpm build
```

Build 完成後，MCP 進入點為：

```bash
node dist/index.js
```

## Enable In OpenAI Codex CLI

建議使用以下指令新增：

```bash
codex mcp add aicreate360-reader -- node "[your-project-path]/dist/index.js"
```

驗證是否成功：

```bash
codex mcp list
```

若需手動設定，在 `~/.codex/config.toml` 加入：

```toml
[mcp_servers.aicreate360-reader]
command = "node"
args = ["/absolute/path/to/aicreate360-mcp/dist/index.js"]
```

取得你機器上的絕對路徑：

```bash
pwd
```

## Enable In OpenAI Codex Desktop

Codex Desktop 使用與 Codex CLI 相同的 MCP 設定。步驟：

1. 使用 `codex mcp add ...` 新增 server
2. 重新啟動 Codex Desktop
3. 開始使用

## What This MCP Exposes

提供一個工具：

- **`aicreate360_fetch_url`**
  輸入任意公開 URL，回傳該網頁的 Markdown 內容。

  | 參數  | 類型           | 說明             |
  | ----- | -------------- | ---------------- |
  | `url` | `string` (URL) | 要擷取的公開網址 |

  回傳格式：乾淨的 Markdown 純文字。

## Notes

- 每次請求即時擷取，無快取。
- 依賴 `https://create360.ai` 服務的可用性。
- 無需任何認證即可使用。
- 受反爬蟲保護的網站會回傳錯誤訊息。
- Runtime 需要 Node.js >= 24 和 pnpm@latest。
