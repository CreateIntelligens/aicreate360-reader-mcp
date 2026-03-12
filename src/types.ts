export type SourceId = "setn" | "ctitv" | "bestshop";

export type ResponseFormat = "markdown" | "json";

export interface SourceSummary {
  id: SourceId;
  title: string;
  description: string;
  contentType: "news" | "media" | "catalog";
  supports: string[];
}

export interface SourceListParams {
  section?: string;
  limit: number;
  offset: number;
}

export interface ContentItem {
  title: string;
  url: string;
  section?: string;
  subtitle?: string;
  price?: number;
  timestampText?: string;
}

export interface PaginatedResult<T> {
  source: SourceId;
  section?: string;
  total: number;
  count: number;
  offset: number;
  hasMore: boolean;
  nextOffset: number | null;
  items: T[];
}

export interface SourceAdapter {
  summary: SourceSummary;
  listSections(): string[];
  listItems(params: SourceListParams): Promise<PaginatedResult<ContentItem>>;
  getItemByUrl(url: string): Promise<ContentItem | null>;
}
