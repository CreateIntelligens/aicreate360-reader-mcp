# aicreate360-reader-mcp

[![npm version](https://img.shields.io/npm/v/aicreate360-reader-mcp)](https://www.npmjs.com/package/aicreate360-reader-mcp)

一個 MCP server，讓 AI 代理可以擷取任何公開網頁內容並轉換為乾淨的 Markdown。

透過 [創造智能](https://www.aicreate360.com/) 服務，將任意 URL 的網頁內容轉為可讀的 Markdown 純文字，無需手動複製貼上。

適用於：

- 新聞網站、部落格、技術文件
- GitHub 頁面、Wiki
- 任何公開可存取的網頁

> 部分網站受反爬蟲保護或需要驗證，這些網站將無法擷取內容，工具會回傳對應的錯誤訊息。

[English README](./README.md)

## 快速開始 (npx)

無需安裝，直接使用 `npx -y aicreate360-reader-mcp` 執行：

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

將以上設定加入你的 MCP 客戶端設定檔：

| 客戶端         | 設定檔路徑                      |
| -------------- | ------------------------------- |
| Claude Code    | `~/.claude.json` or `.mcp.json` |
| Claude Desktop | `claude_desktop_config.json`    |
| Gemini CLI     | `~/.gemini/settings.json`       |

## 透過 npm 安裝

```bash
npm i aicreate360-reader-mcp // 安裝至專案
npm i -g aicreate360-reader-mcp // 全域安裝
```

安裝完成後，將 MCP 客戶端指向安裝的進入點：

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

## 工具

此 server 提供一個工具：

### `fetch_url`

擷取任意公開 URL，回傳該網頁的 Markdown 內容。

| 參數  | 類型           | 說明             |
| ----- | -------------- | ---------------- |
| `url` | `string` (URL) | 要擷取的公開網址 |

回傳格式：乾淨的 Markdown 純文字。

### 使用範例

- `幫我尋找 setn.com 的十則熱門新聞`
- `幫我把這個技術文件轉成 Markdown：https://docs.github.com/en/rest`
- `分析這個部落格文章的觀點：https://blog.example.com/post/1`

## 注意事項

- 每次請求即時擷取，無快取。
- 依賴 [create360.ai](https://create360.ai) 服務的可用性。
- 無需任何認證即可使用。
- 受反爬蟲保護的網站會回傳錯誤訊息。
- 需要 Node.js >= 24。

## 授權條款

[MIT](./LICENSE)
