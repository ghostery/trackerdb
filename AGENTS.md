# AGENTS.md

Read [`docs/contributing.md`](docs/contributing.md) before editing `db/`.

The `research-tracker-domain` skill in `.claude/skills/` gathers sourced facts about a domain into a research report. It does not write files in `db/` — the contributor reviews and applies.

## Before opening a pull request

```sh
npm ci
npm run lint
npm run lint-patterns
npm test
npm run build
```

The SDK in `src/` and tooling in `scripts/` are TypeScript / JavaScript on Node 20+. `npm run lint-fix` applies ESLint + Prettier fixes.
