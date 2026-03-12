import type { ContentItem, PaginatedResult, SourceId } from "../types.js"

export function paginateItems(
  source: SourceId,
  items: ContentItem[],
  offset: number,
  limit: number,
  section?: string
): PaginatedResult<ContentItem> {
  const pagedItems = items.slice(offset, offset + limit)
  const nextOffset = offset + pagedItems.length

  return {
    source,
    section,
    total: items.length,
    count: pagedItems.length,
    offset,
    hasMore: nextOffset < items.length,
    nextOffset: nextOffset < items.length ? nextOffset : null,
    items: pagedItems
  }
}

export function filterBySection(items: ContentItem[], section?: string): ContentItem[] {
  if (!section) {
    return items
  }

  const normalized = section.trim().toLowerCase()
  return items.filter((item) => item.section?.toLowerCase() === normalized)
}
