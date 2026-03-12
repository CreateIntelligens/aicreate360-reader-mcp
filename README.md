# Create360 Content MCP Server

## Overview

This project implements a single MCP server that exposes live content from three Create360-backed sources through one installable interface:

- `setn`: news and breaking-headline content
- `ctitv`: media, program, announcement, and record-style content
- `bestshop`: catalog, category, product, and price content

The design choice is intentional: one server, multiple source adapters. This keeps client integration simple while isolating source-specific parsing logic behind a common tool surface.

## Why One MCP Server

Three separate MCP servers would duplicate the same operational concerns:

- network fetch and timeout handling
- source normalization and pagination
- output formatting and schema validation
- deployment, versioning, and client registration

The current architecture centralizes those concerns once and limits source-specific differences to adapter modules. This reduces maintenance cost without forcing the three sources into a single data model.

## Runtime Architecture

The server runs over `stdio` and fetches live upstream content on demand from:

- `https://create360.ai/setn.com`
- `https://create360.ai/www.ctitv.com.tw`
- `https://create360.ai/bestshop.setddg.com`

For each request, the runtime flow is:

1. Select the requested source adapter.
2. Fetch the latest Create360 reader response.
3. Strip the response envelope and parse the markdown payload.
4. Normalize source-specific content into a shared item shape.
5. Return structured, paginated MCP output.

This means runtime results always reflect the latest upstream state rather than local snapshots.

## MCP Interface

The server currently exposes three read-only tools:

- `create360_list_sources`
  Returns supported sources and their capabilities.
- `create360_list_items`
  Fetches the latest source content and returns normalized, paginated items.
- `create360_get_item`
  Re-fetches the latest source content and resolves a specific item by original URL.

This interface is deliberately narrow. It is sufficient for source discovery, listing, and item lookup, while leaving room to add higher-value source-specific tools later.

## Internal Structure

The implementation is split into:

- `src/index.ts`
  MCP server bootstrap and tool registration.
- `src/adapters/`
  Source-specific parsing logic for `setn`, `ctitv`, and `bestshop`.
- `src/services/source-fetcher.ts`
  Shared live fetch layer for Create360 reader endpoints.
- `src/services/formatting.ts`
  Shared response formatting for markdown and JSON output.
- `src/schemas.ts` and `src/types.ts`
  Validation, output contracts, and shared domain types.

This separation is the main maintainability boundary in the codebase.

## Current Scope

What is implemented:

- single-server, multi-source MCP architecture
- live upstream fetch on every tool call
- normalized listings for all three sources
- URL-based item lookup
- structured output schemas and pagination metadata

What is not yet implemented:

- source-specific high-level workflow tools
- caching or fetch deduplication
- observability and request metrics
- automated evaluation suite
- production deployment configuration

## Operational Notes

- Runtime depends on the availability and response format of the three Create360 endpoints.
- The server assumes Create360 continues returning `text/plain` reader responses with an extractable markdown body.
- Local files under `sources/` are no longer part of the runtime path and should be treated as historical reference material only.

## Development

```bash
pnpm install
pnpm build
pnpm dev
```
