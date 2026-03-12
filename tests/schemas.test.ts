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

  it("rejects invalid list input", () => {
    expect(() =>
      listItemsInputSchema.parse({ source: "unknown", response_format: "markdown" })
    ).toThrow()
  })

  it("validates get item input", () => {
    const parsed = getItemInputSchema.parse({
      source: "bestshop",
      url: "https://bestshop.setddg.com/PM123",
      response_format: "json"
    })

    expect(parsed.source).toBe("bestshop")
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
