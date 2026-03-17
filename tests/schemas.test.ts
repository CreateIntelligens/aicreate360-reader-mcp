import { describe, expect, it } from "vitest"

import { fetchUrlInputSchema, fetchUrlOutputSchema } from "../src/schemas.js"

describe("schemas", () => {
  it("accepts a valid URL input", () => {
    const parsed = fetchUrlInputSchema.parse({ url: "https://example.com" })
    expect(parsed.url).toBe("https://example.com")
  })

  it("rejects non-URL strings", () => {
    expect(() => fetchUrlInputSchema.parse({ url: "not-a-url" })).toThrow()
  })

  it("rejects missing url field", () => {
    expect(() => fetchUrlInputSchema.parse({})).toThrow()
  })

  it("validates fetch output schema", () => {
    expect(() =>
      fetchUrlOutputSchema.parse({
        url: "https://example.com",
        markdown: "# Hello"
      })
    ).not.toThrow()
  })

  it("rejects output with missing markdown", () => {
    expect(() =>
      fetchUrlOutputSchema.parse({
        url: "https://example.com"
      })
    ).toThrow()
  })
})
