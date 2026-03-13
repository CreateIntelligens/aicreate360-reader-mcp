import type { SourceId } from "./types.js"

const sourceAliasMap = new Map<string, SourceId>([
  ["setn", "setn"],
  ["setncom", "setn"],
  ["三立新聞網", "setn"],
  ["三立新聞", "setn"],
  ["ctitv", "ctitv"],
  ["cti", "ctitv"],
  ["ctitvcomtw", "ctitv"],
  ["wwwctitvcomtw", "ctitv"],
  ["中天電視", "ctitv"],
  ["中天新聞", "ctitv"],
  ["中天新聞網", "ctitv"],
  ["中天", "ctitv"],
  ["bestshop", "bestshop"],
  ["bestshopsetddgcom", "bestshop"],
  ["bestshopsetddg", "bestshop"],
  ["三立嚴選", "bestshop"],
  ["嚴選", "bestshop"]
])

function normalizeAliasValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s._/-]+/g, "")
}

export function normalizeSourceId(value: unknown): unknown {
  if (typeof value !== "string") {
    return value
  }

  return sourceAliasMap.get(normalizeAliasValue(value)) ?? value.trim().toLowerCase()
}
