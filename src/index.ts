#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import { SERVER_NAME, SERVER_VERSION } from "./constants.js"
import { fetchUrlInputSchema, fetchUrlOutputSchema } from "./schemas.js"
import { fetchUrlMarkdown } from "./services/source-fetcher.js"

const server = new McpServer({
  name: SERVER_NAME,
  version: SERVER_VERSION
})

server.registerTool(
  "fetch_url",
  {
    title: "Fetch URL as Markdown",
    description:
      "Fetch any public URL and return its content as clean markdown via create360.ai. Works with news sites, documentation, GitHub, wikis, and more.",
    inputSchema: fetchUrlInputSchema,
    outputSchema: fetchUrlOutputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async ({ url }) => {
    try {
      const markdown = await fetchUrlMarkdown(url)
      const payload = { url, markdown }

      return {
        content: [{ type: "text", text: markdown }],
        structuredContent: payload as unknown as Record<string, unknown>
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        content: [{ type: "text", text: message }],
        isError: true
      }
    }
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
