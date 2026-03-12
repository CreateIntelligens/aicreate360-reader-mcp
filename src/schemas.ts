import { z } from "zod";
import { DEFAULT_LIMIT, MAX_LIMIT } from "./constants.js";

export const responseFormatSchema = z.enum(["markdown", "json"]).default("markdown");

export const sourceIdSchema = z.enum(["setn", "ctitv", "bestshop"]);

export const listItemsInputSchema = z.object({
  source: sourceIdSchema.describe("Which source to query."),
  section: z.string().trim().min(1).optional().describe("Optional section/category name for the selected source."),
  limit: z.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT).describe(`Maximum items to return (1-${MAX_LIMIT}).`),
  offset: z.number().int().min(0).default(0).describe("Result offset for pagination."),
  response_format: responseFormatSchema.describe("Response format: markdown or json."),
});

export const getItemInputSchema = z.object({
  source: sourceIdSchema.describe("Which source to query."),
  url: z.string().url().describe("Original item URL from the source listing."),
  response_format: responseFormatSchema.describe("Response format: markdown or json."),
});

export const sourceSummaryOutputSchema = z.object({
  sources: z.array(
    z.object({
      id: sourceIdSchema,
      title: z.string(),
      description: z.string(),
      contentType: z.enum(["news", "media", "catalog"]),
      supports: z.array(z.string()),
    }),
  ),
});

export const listItemsOutputSchema = z.object({
  source: sourceIdSchema,
  section: z.string().optional(),
  total: z.number(),
  count: z.number(),
  offset: z.number(),
  hasMore: z.boolean(),
  nextOffset: z.number().nullable(),
  items: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      section: z.string().optional(),
      subtitle: z.string().optional(),
      price: z.number().optional(),
      timestampText: z.string().optional(),
    }),
  ),
});

export const getItemOutputSchema = z.object({
  item: z
    .object({
      title: z.string(),
      url: z.string().url(),
      section: z.string().optional(),
      subtitle: z.string().optional(),
      price: z.number().optional(),
      timestampText: z.string().optional(),
    })
    .nullable(),
});
