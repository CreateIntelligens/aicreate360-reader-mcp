import { fetchSourceMarkdown } from "../services/source-fetcher.js"
import type { ContentItem, SourceAdapter, SourceListParams } from "../types.js"

import { filterBySection, paginateItems } from "./shared.js"

const sectionBoundaries = [
  { label: "節目聯名系列", start: "[節目聯名系列]", end: "[美食]" },
  { label: "美食", start: "[美食]", end: "[居家]" },
  { label: "居家", start: "[居家]", end: "[服飾]" },
  { label: "服飾", start: "[服飾]", end: "" }
]

function parseProducts(section: string, block: string): ContentItem[] {
  const pattern =
    /\[#####\s+([^\]]+)\]\((https:\/\/bestshop\.setddg\.com\/[^)]+)\)\s+####\s+([0-9,]+)/g
  const items: ContentItem[] = []
  let match: RegExpExecArray | null

  while ((match = pattern.exec(block)) !== null) {
    items.push({
      title: match[1].trim(),
      url: match[2].trim(),
      section,
      price: Number(match[3].replace(/,/g, ""))
    })
  }

  return items
}

function extractSection(
  sourceText: string,
  label: string,
  start: string,
  end: string
): ContentItem[] {
  const startIndex = sourceText.indexOf(start)
  if (startIndex === -1) {
    return []
  }

  const endIndex = end ? sourceText.indexOf(end, startIndex + start.length) : -1
  const block =
    endIndex === -1 ? sourceText.slice(startIndex) : sourceText.slice(startIndex, endIndex)
  return parseProducts(label, block)
}

export const bestshopAdapter: SourceAdapter = {
  summary: {
    id: "bestshop",
    title: "Bestshop",
    description:
      "Shopping/catalog site with promotional banners, category pages, products, and prices.",
    contentType: "catalog",
    supports: ["list categories", "list products", "lookup product by URL"]
  },
  listSections() {
    return sectionBoundaries.map((entry) => entry.label)
  },
  async listItems(params: SourceListParams) {
    const sourceText = await fetchSourceMarkdown("bestshop")
    const allItems = sectionBoundaries.flatMap((entry) =>
      extractSection(sourceText, entry.label, entry.start, entry.end)
    )
    const filtered = filterBySection(allItems, params.section)
    return paginateItems("bestshop", filtered, params.offset, params.limit, params.section)
  },
  async getItemByUrl(url: string) {
    const sourceText = await fetchSourceMarkdown("bestshop")
    const allItems = sectionBoundaries.flatMap((entry) =>
      extractSection(sourceText, entry.label, entry.start, entry.end)
    )
    return allItems.find((item) => item.url === url) ?? null
  }
}
