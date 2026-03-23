# CLAUDE.md

## Project

MCP server that fetches any public URL and returns clean Markdown via create360.ai. Single tool: `aicreate360_fetch_url`.

- TypeScript (ES2022, NodeNext), Node.js >= 24, pnpm
- Entry: `src/index.ts` → `dist/index.js`
- Depends on: `@modelcontextprotocol/sdk`, `zod`

## Architecture

```
src/
├── index.ts                  # MCP server setup, tool registration
├── constants.ts              # server name, version, timeout, base URL
├── types.ts                  # FetchResult interface
├── schemas.ts                # Zod input/output schemas
└── services/
    └── source-fetcher.ts     # core: fetch URL → strip envelope → detect blocked → return markdown
tests/
├── schemas.test.ts
└── source-fetcher.test.ts
```

## Commands

```bash
pnpm install          # install deps
pnpm build            # tsc compile
pnpm dev              # dev mode (tsx)
pnpm start            # run server (node dist/index.js)
pnpm test             # vitest run
pnpm test:coverage    # vitest + coverage (threshold: 80%)
pnpm check            # type check (tsc --noEmit)
pnpm lint             # oxlint --type-aware --fix
pnpm lint:check       # oxlint check only
pnpm format           # oxfmt
```

## Code Quality

- Linter: oxlint (type-aware), config: `.oxlintrc.json`
- Formatter: oxfmt, config: `.oxfmtrc.json`
- Tests: Vitest, coverage threshold 80% (lines/functions/branches/statements)
- Commits: Conventional Commits enforced by commitlint + husky
- Pre-commit hook: `pnpm lint-staged` + `pnpm check`
- CI: GitHub Actions on push to main/dev and PR to main

## Git Workflow

- Main branch: `main`, dev branch: `dev`
- Commit messages must follow Conventional Commits
- PR target: `main`
