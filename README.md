# AICreate360 Reader MCP Server

[![CI](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/CreateIntelligens/aicreate360-reader-mcp/actions/workflows/CI.yml)

## Overview

一個 MCP server，讓 AI 代理可以擷取任何公開網頁內容並轉換為乾淨的 Markdown。

透過 [create360.ai](https://create360.ai) 服務，將任意 URL 的網頁內容轉為可讀的 Markdown 純文字，無需手動複製貼上。

適用於：

- 新聞網站、部落格、技術文件
- GitHub 頁面、Wiki
- 任何公開可存取的網頁

### 使用範例 (Gemini CLI)

- `幫我尋找 setn.com 的十則熱門新聞`
- `幫我把這個技術文件轉成 Markdown：https://docs.github.com/en/rest`
- `分析這個部落格文章的觀點：https://blog.example.com/post/1`

> 部分網站受反爬蟲保護或需要驗證，這些網站將無法擷取內容，工具會回傳對應的錯誤訊息。

## Install

```bash
git clone https://github.com/CreateIntelligens/aicreate360-reader-mcp.git
cd aicreate360-reader-mcp
pnpm install
pnpm build
```

Build 完成後，MCP 進入點為：

```bash
node dist/index.js
```

## Enable In Gemini CLI

### 1. 使用 CLI 自動新增 (建議方式)

您可以根據需求選擇安裝範圍（預設建議使用 **User (全域)** 較為方便）：

**User-level (全域):**

```bash
gemini mcp add aicreate360-reader-mcp node "[your-project-path]/dist/index.js"
```

**Project-level (僅限當前專案):**

```bash
gemini mcp add --scope project aicreate360-reader-mcp node "[your-project-path]/dist/index.js"
```

> **小技巧**：在專案目錄下執行 `pwd` 即可取得絕對路徑（`your-project-path`）。

### 2. 手動設定 `settings.json`

若需手動設定，請在 `~/.gemini/settings.json` (User) 或 `.gemini/settings.json` (Project) 加入：

```json
{
  "mcpServers": {
    "aicreate360-reader-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/aicreate360-reader-mcp/dist/index.js"]
    }
  }
}
```

### 3. 驗證是否成功

在 Shell 執行：

```bash
gemini mcp list
```

或在 Gemini CLI 互動對話中使用：

```bash
/mcp list
```

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
