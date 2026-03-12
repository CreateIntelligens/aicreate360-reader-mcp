import type { ContentItem, PaginatedResult, ResponseFormat, SourceSummary } from "../types.js";

export function asText(
  format: ResponseFormat,
  title: string,
  payload: unknown,
  markdown: string,
): string {
  if (format === "json") {
    return JSON.stringify(payload, null, 2);
  }

  return `# ${title}\n\n${markdown}`;
}

export function renderSourceSummaryMarkdown(summaries: SourceSummary[]): string {
  return summaries
    .map((summary) => {
      const sections = summary.supports.map((value) => `- ${value}`).join("\n");
      return `## ${summary.id}\n\n- Title: ${summary.title}\n- Type: ${summary.contentType}\n- Description: ${summary.description}\n- Capabilities:\n${sections}`;
    })
    .join("\n\n");
}

export function renderPaginatedItemsMarkdown(result: PaginatedResult<ContentItem>): string {
  const header = [
    `- Source: ${result.source}`,
    `- Section: ${result.section ?? "all"}`,
    `- Total matched: ${result.total}`,
    `- Returned: ${result.count}`,
    `- Offset: ${result.offset}`,
    `- Has more: ${result.hasMore ? "yes" : "no"}`,
  ].join("\n");

  const items = result.items
    .map((item, index) => {
      const fields = [
        `${index + 1}. ${item.title}`,
        `   - URL: ${item.url}`,
        item.section ? `   - Section: ${item.section}` : null,
        item.subtitle ? `   - Subtitle: ${item.subtitle}` : null,
        item.timestampText ? `   - Time: ${item.timestampText}` : null,
        typeof item.price === "number" ? `   - Price: ${item.price}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      return fields;
    })
    .join("\n");

  return `${header}\n\n${items || "No items found."}`;
}

export function renderItemMarkdown(item: ContentItem): string {
  const lines = [
    `- Title: ${item.title}`,
    `- URL: ${item.url}`,
    item.section ? `- Section: ${item.section}` : null,
    item.subtitle ? `- Subtitle: ${item.subtitle}` : null,
    item.timestampText ? `- Time: ${item.timestampText}` : null,
    typeof item.price === "number" ? `- Price: ${item.price}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}
