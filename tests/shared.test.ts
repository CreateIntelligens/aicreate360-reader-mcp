import { describe, expect, it } from "vitest"

import { filterBySection, paginateItems } from "../src/adapters/shared.js"
import type { ContentItem } from "../src/types.js"

const items: ContentItem[] = [
  { title: "A", url: "https://example.com/a", section: "news" },
  { title: "B", url: "https://example.com/b", section: "sports" },
  { title: "C", url: "https://example.com/c", section: "news" }
]

describe("shared adapter helpers", () => {
  it("filters items by section case-insensitively", () => {
    expect(filterBySection(items, " NEWS ")).toEqual([
      { title: "A", url: "https://example.com/a", section: "news" },
      { title: "C", url: "https://example.com/c", section: "news" }
    ])
  })

  it("returns all items when section is omitted", () => {
    expect(filterBySection(items)).toEqual(items)
  })

  it("paginates items with metadata", () => {
    expect(paginateItems("setn", items, 1, 1, "sports")).toEqual({
      source: "setn",
      section: "sports",
      total: 3,
      count: 1,
      offset: 1,
      hasMore: true,
      nextOffset: 2,
      items: [{ title: "B", url: "https://example.com/b", section: "sports" }]
    })
  })

  it("returns nextOffset null when pagination reaches the end", () => {
    expect(paginateItems("setn", items, 2, 5)).toMatchObject({
      total: 3,
      count: 1,
      hasMore: false,
      nextOffset: null
    })
  })
})
