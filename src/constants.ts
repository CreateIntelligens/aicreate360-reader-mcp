import { readFileSync } from "node:fs"

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8")) as {
  version: string
}

export const SERVER_NAME = "aicreate360-reader-mcp"
export const SERVER_VERSION: string = pkg.version
export const FETCH_TIMEOUT_MS = 20_000
export const CREATE360_BASE_URL = "https://create360.ai"
