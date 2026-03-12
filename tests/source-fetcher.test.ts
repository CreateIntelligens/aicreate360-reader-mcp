import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { FETCH_TIMEOUT_MS } from "../src/constants.js"
import { fetchSourceMarkdown } from "../src/services/source-fetcher.js"

describe("source fetcher", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("strips the AICreate360 reader envelope", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => "Title: test\n\nMarkdown Content:\nHello world"
    } as Response)

    await expect(fetchSourceMarkdown("setn")).resolves.toBe("Hello world")
  })

  it("returns trimmed body when there is no envelope", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => "  raw body  "
    } as Response)

    await expect(fetchSourceMarkdown("ctitv")).resolves.toBe("raw body")
  })

  it("throws on non-ok responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 503
    } as Response)

    await expect(fetchSourceMarkdown("bestshop")).rejects.toThrow(
      "Fetch failed for 'bestshop' with HTTP 503"
    )
  })

  it("throws when the response body is empty after stripping", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => "Markdown Content:\n   "
    } as Response)

    await expect(fetchSourceMarkdown("setn")).rejects.toThrow(
      "Fetch for 'setn' returned an empty body"
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

    const request = fetchSourceMarkdown("setn")
    const assertion = expect(request).rejects.toThrow(
      `Fetch timed out for 'setn' after ${FETCH_TIMEOUT_MS}ms`
    )
    await vi.advanceTimersByTimeAsync(FETCH_TIMEOUT_MS + 5)
    await assertion
  })
})
