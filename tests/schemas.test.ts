import { describe, expect, it } from "vitest"

import {
  getItemInputSchema,
  getItemOutputSchema,
  listItemsInputSchema,
  listItemsOutputSchema,
  sourceSummaryOutputSchema
} from "../src/schemas.js"

describe("schemas", () => {
  it("applies defaults to list input schema", () => {
    const parsed = listItemsInputSchema.parse({ source: "setn", response_format: "markdown" })
    expect(parsed.limit).toBe(10)
    expect(parsed.offset).toBe(0)
  })

  it("normalizes source aliases in list input", () => {
    const parsed = listItemsInputSchema.parse({
      source: "三立新聞網",
      response_format: "markdown"
    })

    expect(parsed.source).toBe("setn")
  })

  it("rejects invalid list input", () => {
    expect(() =>
      listItemsInputSchema.parse({ source: "unknown", response_format: "markdown" })
    ).toThrow()
  })

  it("validates get item input", () => {
    const parsed = getItemInputSchema.parse({
      source: "三立嚴選",
      url: "https://bestshop.setddg.com/PM123",
      response_format: "json"
    })

    expect(parsed.source).toBe("bestshop")
  })

  it("normalizes CTITV aliases with mixed casing and domains", () => {
    expect(
      getItemInputSchema.parse({
        source: "WWW.CTITV.COM.TW",
        url: "https://www.ctitv.com.tw/announce/2022/07/11063",
        response_format: "markdown"
      }).source
    ).toBe("ctitv")
  })

  it("validates source summary output", () => {
    const parsed = sourceSummaryOutputSchema.parse({
      sources: [
        {
          id: "ctitv",
          title: "CTITV",
          description: "desc",
          contentType: "media",
          supports: ["list sections"]
        }
      ]
    })

    expect(parsed.sources).toHaveLength(1)
  })

  it("validates list item output", () => {
    expect(() =>
      listItemsOutputSchema.parse({
        source: "setn",
        total: 1,
        count: 1,
        offset: 0,
        hasMore: false,
        nextOffset: null,
        items: [
          {
            title: "Headline",
            url: "https://example.com/headline"
          }
        ]
      })
    ).not.toThrow()
  })

  it("accepts null get item output", () => {
    expect(() => getItemOutputSchema.parse({ item: null })).not.toThrow()
  })
})
