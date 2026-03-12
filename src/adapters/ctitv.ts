import { fetchSourceMarkdown } from "../services/source-fetcher.js"
import type { ContentItem, SourceAdapter, SourceListParams } from "../types.js"

import { filterBySection, paginateItems } from "./shared.js"

function collectSection(sourceText: string, section: string, patterns: RegExp[]): ContentItem[] {
  const items: ContentItem[] = []

  for (const pattern of patterns) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(sourceText)) !== null) {
      const title = match[1].trim()
      const url = match[2].trim()
      if (!title || title === "中天新聞網" || title === "中天電視") {
        continue
      }

      items.push({ title, url, section })
    }
  }

  return dedupeItems(items)
}

function dedupeItems(items: ContentItem[]): ContentItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.title}|${item.url}|${item.section}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function buildSections(sourceText: string) {
  return {
    programs: collectSection(sourceText, "programs", [
      /\*\s+\[([^\]]+)\]\((https:\/\/www\.ctitv\.com\.tw\/channel(?:36|39)[^)]+)\)/g
    ]),
    anchors: collectSection(sourceText, "anchors", [
      /\*\s+\[([^\]]+)\]\((https:\/\/www\.ctitv\.com\.tw\/anchor\/[^)]+)\)/g
    ]),
    ethics: collectSection(sourceText, "ethics", [
      /### \[([^\]]+)\]\((https:\/\/www\.ctitv\.com\.tw\/about-cti\/cti-ethics-committee\/[^)]+)\s+"[^"]+"\)/g
    ]),
    complaints: collectSection(sourceText, "complaints", [
      /### \[([^\]]+)\]\((https:\/\/www\.ctitv\.com\.tw\/about-cti\/cti-customer-complaint\/[^)]+)\s+"[^"]+"\)/g
    ]),
    announcements: collectSection(sourceText, "announcements", [
      /### \[([^\]]+)\]\((https:\/\/www\.ctitv\.com\.tw\/announce\/[^)]+)\s+"[^"]+"\)/g
    ])
  }
}

export const ctitvAdapter: SourceAdapter = {
  summary: {
    id: "ctitv",
    title: "CTITV",
    description:
      "Media site with programs, anchors, announcements, ethics records, and complaint reports.",
    contentType: "media",
    supports: ["list sections", "list records", "lookup record by URL"]
  },
  listSections() {
    return ["programs", "anchors", "ethics", "complaints", "announcements"]
  },
  async listItems(params: SourceListParams) {
    const sourceText = await fetchSourceMarkdown("ctitv")
    const sections = buildSections(sourceText)
    const allItems = Object.values(sections).flat()
    const filtered = filterBySection(allItems, params.section)
    return paginateItems("ctitv", filtered, params.offset, params.limit, params.section)
  },
  async getItemByUrl(url: string) {
    const sourceText = await fetchSourceMarkdown("ctitv")
    const sections = buildSections(sourceText)
    const allItems = Object.values(sections).flat()
    return allItems.find((item) => item.url === url) ?? null
  }
}
