import { CREATE360_BASE_URL, FETCH_TIMEOUT_MS, SERVER_NAME, SERVER_VERSION } from "../constants.js"

const BLOCKED_PATTERNS = [
  // Cloudflare
  "just a moment",
  "checking your browser",
  "ray id",
  "enable javascript and cookies",
  "cf-browser-verification",
  "security verification",
  "security challenge",
  "security service",
  "malicious bots",
  // Generic anti-bot / WAF
  "needs verification",
  "captcha",
  "access denied",
  "bot protection",
  "bot detected",
  "automated access",
  "unusual traffic",
  "too many requests",
  "rate limit",
  "forbidden",
  "please verify you are a human",
  "verify you are human",
  "are you a robot",
  "not a robot",
  // Chinese
  "請完成驗證",
  "需要驗證",
  "反爬蟲",
  "安全驗證",
  "機器人驗證"
]

/** Weak signals — only considered blocked when content is very short. */
const SOFT_BLOCKED_PATTERNS = ["cloudflare", "protect", "blocked", "challenge"]

const SHORT_CONTENT_THRESHOLD = 512

function stripReaderEnvelope(body: string): string {
  const marker = "Markdown Content:"
  const index = body.indexOf(marker)
  if (index === -1) {
    return body.trim()
  }

  return body.slice(index + marker.length).trim()
}

function detectBlocked(content: string, headers: Headers): boolean {
  const lower = content.toLowerCase()

  // Strong pattern match — always blocked regardless of length
  if (BLOCKED_PATTERNS.some((pattern) => lower.includes(pattern))) {
    return true
  }

  // Short content + soft pattern — likely a challenge page
  if (content.length < SHORT_CONTENT_THRESHOLD) {
    if (SOFT_BLOCKED_PATTERNS.some((pattern) => lower.includes(pattern))) {
      return true
    }
  }

  // Cloudflare server header + very short content — challenge page that slipped through
  const server = headers.get("server") ?? ""
  if (server.toLowerCase().includes("cloudflare") && content.length < SHORT_CONTENT_THRESHOLD) {
    return true
  }

  return false
}

function blockedError(url: string): Error {
  return new Error(
    `The site (${url}) could not be fetched — it may be protected by an anti-bot service or requires verification. Try another source.\n` +
      `該網站 (${url}) 無法擷取內容，可能受到反爬蟲服務保護或需要驗證。請嘗試其他來源。`
  )
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

    if (detectBlocked(content, response.headers)) {
      throw blockedError(url)
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
