import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { adapters, getAdapter } from "./adapters/index.js";
import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import {
  getItemInputSchema,
  getItemOutputSchema,
  listItemsInputSchema,
  listItemsOutputSchema,
  sourceSummaryOutputSchema,
} from "./schemas.js";
import { asText, renderItemMarkdown, renderPaginatedItemsMarkdown, renderSourceSummaryMarkdown } from "./services/formatting.js";

const server = new McpServer({
  name: SERVER_NAME,
  version: SERVER_VERSION,
});

server.registerTool(
  "create360_list_sources",
  {
    title: "List Create360 Sources",
    description: "List all supported Create360 content sources and the capabilities each adapter exposes.",
    inputSchema: z.object({
      response_format: z.enum(["markdown", "json"]).default("markdown"),
    }),
    outputSchema: sourceSummaryOutputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ response_format }) => {
    const payload = { sources: Object.values(adapters).map((adapter) => adapter.summary) };
    return {
      content: [
        {
          type: "text",
          text: asText(
            response_format,
            "Create360 Sources",
            payload,
            renderSourceSummaryMarkdown(payload.sources),
          ),
        },
      ],
      structuredContent: payload as unknown as Record<string, unknown>,
    };
  },
);

server.registerTool(
  "create360_list_items",
  {
    title: "List Source Items",
    description:
      "List available items for a source. Supports source-specific sections and returns paginated, structured results.",
    inputSchema: listItemsInputSchema,
    outputSchema: listItemsOutputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ source, section, limit, offset, response_format }) => {
    const adapter = getAdapter(source);
    if (section && !adapter.listSections().some((value) => value.toLowerCase() === section.toLowerCase())) {
      throw new Error(`Unknown section '${section}' for source '${source}'. Valid sections: ${adapter.listSections().join(", ")}`);
    }

    const payload = await adapter.listItems({ section, limit, offset });

    return {
      content: [
        {
          type: "text",
          text: asText(
            response_format,
            `${source} Items`,
            payload,
            renderPaginatedItemsMarkdown(payload),
          ),
        },
      ],
      structuredContent: payload as unknown as Record<string, unknown>,
    };
  },
);

server.registerTool(
  "create360_get_item",
  {
    title: "Get Source Item",
    description: "Look up a previously listed item by its original source URL and return the normalized record.",
    inputSchema: getItemInputSchema,
    outputSchema: getItemOutputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async ({ source, url, response_format }) => {
    const adapter = getAdapter(source);
    const item = await adapter.getItemByUrl(url);
    const payload = { item };

    return {
      content: [
        {
          type: "text",
          text: asText(
            response_format,
            `${source} Item`,
            payload,
            item ? renderItemMarkdown(item) : "No matching item found.",
          ),
        },
      ],
      structuredContent: payload as unknown as Record<string, unknown>,
      isError: item === null,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
