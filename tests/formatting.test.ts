import { describe, expect, it } from "vitest"

import {
  asText,
  renderItemMarkdown,
  renderPaginatedItemsMarkdown,
  renderSourceSummaryMarkdown
} from "../src/services/formatting.js"

describe("formatting helpers", () => {
  it("renders json output when requested", () => {
    expect(asText("json", "Title", { ok: true }, "ignored")).toBe('{\n  "ok": true\n}')
  })

  it("renders markdown output when requested", () => {
    expect(asText("markdown", "Title", { ok: true }, "body")).toBe("# Title\n\nbody")
  })

  it("renders source summaries", () => {
    const text = renderSourceSummaryMarkdown([
      {
        id: "setn",
        title: "SETN",
        description: "desc",
        contentType: "news",
        supports: ["list headlines", "lookup headline by URL"]
      }
    ])

    expect(text).toContain("## setn")
    expect(text).toContain("- Capabilities:")
    expect(text).toContain("- list headlines")
  })

  it("renders paginated items including optional fields", () => {
    const text = renderPaginatedItemsMarkdown({
      source: "bestshop",
      section: "美食",
      total: 2,
      count: 1,
      offset: 0,
      hasMore: true,
      nextOffset: 1,
      items: [
        {
          title: "Product",
          url: "https://example.com/product",
          section: "美食",
          subtitle: "sub",
          price: 99,
          timestampText: "10:00"
        }
      ]
    })

    expect(text).toContain("- Source: bestshop")
    expect(text).toContain("1. Product")
    expect(text).toContain("Price: 99")
  })

  it("renders fallback text when there are no items", () => {
    const text = renderPaginatedItemsMarkdown({
      source: "setn",
      total: 0,
      count: 0,
      offset: 0,
      hasMore: false,
      nextOffset: null,
      items: []
    })

    expect(text).toContain("No items found.")
  })

  it("renders a single item markdown block", () => {
    const text = renderItemMarkdown({
      title: "Headline",
      url: "https://example.com/headline",
      section: "快訊",
      timestampText: "13:30"
    })

    expect(text).toContain("- Title: Headline")
    expect(text).toContain("- Time: 13:30")
  })

  it("omits optional item fields when they are absent", () => {
    const listText = renderPaginatedItemsMarkdown({
      source: "setn",
      total: 1,
      count: 1,
      offset: 0,
      hasMore: false,
      nextOffset: null,
      items: [{ title: "Simple", url: "https://example.com/simple" }]
    })
    const itemText = renderItemMarkdown({
      title: "Simple",
      url: "https://example.com/simple"
    })

    expect(listText).not.toContain("   - Section:")
    expect(listText).not.toContain("   - Subtitle:")
    expect(listText).not.toContain("   - Price:")
    expect(itemText).not.toContain("Price:")
  })
})
