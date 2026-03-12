import { FETCH_TIMEOUT_MS, SOURCE_URLS } from "../constants.js"
import type { SourceId } from "../types.js"

function stripReaderEnvelope(body: string): string {
  const marker = "Markdown Content:"
  const index = body.indexOf(marker)
  if (index === -1) {
    return body.trim()
  }

  return body.slice(index + marker.length).trim()
}

export async function fetchSourceMarkdown(source: SourceId): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(SOURCE_URLS[source], {
      method: "GET",
      headers: {
        Accept: "text/plain, text/markdown, text/*;q=0.9, */*;q=0.1",
        "User-Agent": "create360-content-mcp-server/0.1.0"
      },
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`Fetch failed for '${source}' with HTTP ${response.status}`)
    }

    const body = await response.text()
    const content = stripReaderEnvelope(body)
    if (!content) {
      throw new Error(`Fetch for '${source}' returned an empty body`)
    }

    return content
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Fetch timed out for '${source}' after ${FETCH_TIMEOUT_MS}ms`)
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}
