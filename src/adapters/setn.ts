import { fetchSourceMarkdown } from "../services/source-fetcher.js";
import type { ContentItem, SourceAdapter, SourceListParams } from "../types.js";
import { filterBySection, paginateItems } from "./shared.js";

const sectionMap = [
  { label: "快訊", start: "快訊", end: "三立新聞網 SETN.COM | 一網能知天下事 一鍵開啟新視野" },
  { label: "熱門新聞", start: "[熱門新聞]", end: "[最新影音]" },
];

function extractLinks(block: string, section: string): ContentItem[] {
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const items: ContentItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(block)) !== null) {
    const title = match[1].trim().replace(/\*\*/g, "");
    const url = match[2].trim();

    if (!title || title.startsWith("Image ") || title === "更多") {
      continue;
    }

    const timeMatch = title.match(/(.+?)\s+(\d{1,2}:\d{2})$/);
    if (timeMatch) {
      items.push({
        title: timeMatch[1].trim(),
        url,
        section,
        timestampText: timeMatch[2],
      });
      continue;
    }

    items.push({ title, url, section });
  }

  return dedupeItems(items);
}

function extractSection(sourceText: string, label: string, start: string, end: string): ContentItem[] {
  const startIndex = sourceText.indexOf(start);
  if (startIndex === -1) {
    return [];
  }

  const endIndex = sourceText.indexOf(end, startIndex + start.length);
  const block = endIndex === -1 ? sourceText.slice(startIndex) : sourceText.slice(startIndex, endIndex);
  return extractLinks(block, label);
}

function dedupeItems(items: ContentItem[]): ContentItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.title}|${item.url}|${item.section}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export const setnAdapter: SourceAdapter = {
  summary: {
    id: "setn",
    title: "SETN",
    description: "High-frequency news homepage with breaking headlines, popular news, and live content.",
    contentType: "news",
    supports: ["list sections", "list headlines", "lookup headline by URL"],
  },
  listSections() {
    return sectionMap.map((entry) => entry.label);
  },
  async listItems(params: SourceListParams) {
    const sourceText = await fetchSourceMarkdown("setn");
    const allItems = sectionMap.flatMap((entry) => extractSection(sourceText, entry.label, entry.start, entry.end));
    const filtered = filterBySection(allItems, params.section);
    return paginateItems("setn", filtered, params.offset, params.limit, params.section);
  },
  async getItemByUrl(url: string) {
    const sourceText = await fetchSourceMarkdown("setn");
    const allItems = sectionMap.flatMap((entry) => extractSection(sourceText, entry.label, entry.start, entry.end));
    return allItems.find((item) => item.url === url) ?? null;
  },
};
