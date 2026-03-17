import { CREATE360_BASE_URL, FETCH_TIMEOUT_MS, SERVER_NAME, SERVER_VERSION } from "../constants.js"

const BLOCKED_PATTERNS = [
  "needs verification",
  "captcha",
  "access denied",
  "cloudflare",
  "just a moment",
  "checking your browser",
  "ray id",
  "enable javascript and cookies",
  "please verify you are a human",
  "請完成驗證",
  "需要驗證",
  "反爬蟲"
]

function stripReaderEnvelope(body: string): string {
  const marker = "Markdown Content:"
  const index = body.indexOf(marker)
  if (index === -1) {
    return body.trim()
  }

  return body.slice(index + marker.length).trim()
}

function detectBlocked(content: string): boolean {
  const lower = content.toLowerCase()
  return BLOCKED_PATTERNS.some((pattern) => lower.includes(pattern))
}

export async function fetchUrlMarkdown(url: string): Promise<string> {
  const targetUrl = `${CREATE360_BASE_URL}/${url}`
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "text/plain, text/markdown, text/*;q=0.9, */*;q=0.1",
        "User-Agent": `${SERVER_NAME}/${SERVER_VERSION}`
      },
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`Fetch failed for '${url}' with HTTP ${response.status}`)
    }

    const body = await response.text()
    const content = stripReaderEnvelope(body)

    if (!content) {
      throw new Error(`Fetch for '${url}' returned an empty body`)
    }

    if (detectBlocked(content)) {
      throw new Error(
        `該網站 (${url}) 無法擷取內容，可能受到反爬蟲服務保護或需要驗證。請嘗試其他網站。`
      )
    }

    return content
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Fetch timed out for '${url}' after ${FETCH_TIMEOUT_MS}ms`)
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}
