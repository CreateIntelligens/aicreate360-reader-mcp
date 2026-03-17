import { z } from "zod"

export const fetchUrlInputSchema = z.object({
  url: z.string().url().describe("The public URL to fetch and convert to markdown.")
})

export const fetchUrlOutputSchema = z.object({
  url: z.string().url(),
  markdown: z.string()
})
