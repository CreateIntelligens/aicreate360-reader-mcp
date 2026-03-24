import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { FETCH_TIMEOUT_MS } from "../src/constants.js"
import { fetchUrlMarkdown } from "../src/services/source-fetcher.js"

describe("source fetcher", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("strips the create360 reader envelope", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () => "Title: test\n\nMarkdown Content:\nHello world"
    } as Response)

    await expect(fetchUrlMarkdown("https://example.com")).resolves.toBe("Hello world")
  })

  it("returns trimmed body when there is no envelope", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () => "  raw body  "
    } as Response)

    await expect(fetchUrlMarkdown("https://example.com")).resolves.toBe("raw body")
  })

  it("builds the correct create360 URL", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () => "content"
    } as Response)

    await fetchUrlMarkdown("https://example.com/page")
    expect(spy).toHaveBeenCalledWith(
      "https://create360.ai/https://example.com/page",
      expect.objectContaining({ method: "GET" })
    )
  })

  it("throws on non-ok responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 503
    } as Response)

    await expect(fetchUrlMarkdown("https://example.com")).rejects.toThrow(
      "Fetch failed for 'https://example.com' with HTTP 503"
    )
  })

  it("throws when the response body is empty after stripping", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () => "Markdown Content:\n   "
    } as Response)

    await expect(fetchUrlMarkdown("https://example.com")).rejects.toThrow(
      "Fetch for 'https://example.com' returned an empty body"
    )
  })

  it("throws a timeout error on aborted fetches", async () => {
    vi.useFakeTimers()
    vi.spyOn(globalThis, "fetch").mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal as AbortSignal
          signal.addEventListener("abort", () => {
            const error = new Error("aborted")
            error.name = "AbortError"
            reject(error)
          })
        }) as Promise<Response>
    )

    const request = fetchUrlMarkdown("https://example.com")
    const assertion = expect(request).rejects.toThrow(
      `Fetch timed out for 'https://example.com' after ${FETCH_TIMEOUT_MS}ms`
    )
    await vi.advanceTimersByTimeAsync(FETCH_TIMEOUT_MS + 5)
    await assertion
  })

  it("detects anti-crawler protection in response content", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () => "Markdown Content:\nPlease verify you are a human to continue"
    } as Response)

    await expect(fetchUrlMarkdown("https://protected-site.com")).rejects.toThrow(
      "could not be fetched"
    )
  })

  it("detects cloudflare checking-your-browser pattern", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () => "Markdown Content:\nChecking your browser before accessing the site"
    } as Response)

    await expect(fetchUrlMarkdown("https://cloudflare-site.com")).rejects.toThrow(
      "could not be fetched"
    )
  })

  it("detects security verification pattern (Cloudflare)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () =>
        "Markdown Content:\nPerforming security verification\nThis website uses a security service to protect against malicious bots."
    } as Response)

    await expect(fetchUrlMarkdown("https://stackoverflow.com/questions/1732348")).rejects.toThrow(
      "could not be fetched"
    )
  })

  it("detects Chinese verification messages", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () => "Markdown Content:\n請完成驗證後繼續瀏覽"
    } as Response)

    await expect(fetchUrlMarkdown("https://tw-site.com")).rejects.toThrow("無法擷取內容")
  })

  it("detects soft pattern when content is short", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () => "Markdown Content:\nYou have been blocked."
    } as Response)

    await expect(fetchUrlMarkdown("https://blocked-site.com")).rejects.toThrow(
      "could not be fetched"
    )
  })

  it("does not flag soft pattern in long content", async () => {
    const longContent = "This article discusses how to protect your garden. ".repeat(20)
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () => `Markdown Content:\n${longContent}`
    } as Response)

    await expect(fetchUrlMarkdown("https://example.com")).resolves.toBe(longContent.trim())
  })

  it("detects cloudflare server header with short content", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers({ server: "cloudflare" }),
      text: async () => "Markdown Content:\nPlease wait..."
    } as Response)

    await expect(fetchUrlMarkdown("https://cf-site.com")).rejects.toThrow("could not be fetched")
  })

  it("does not flag cloudflare server header with long content", async () => {
    const longContent = "Real article content about programming. ".repeat(20)
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers({ server: "cloudflare" }),
      text: async () => `Markdown Content:\n${longContent}`
    } as Response)

    await expect(fetchUrlMarkdown("https://cf-site.com")).resolves.toBe(longContent.trim())
  })

  it("returns bilingual error message when blocked", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () => "Markdown Content:\ncaptcha required"
    } as Response)

    await expect(fetchUrlMarkdown("https://blocked.com")).rejects.toThrow("無法擷取內容")
    await expect(fetchUrlMarkdown("https://blocked.com")).rejects.toThrow("could not be fetched")
  })
})
