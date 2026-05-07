# AGENTS.md

Orientation for anyone — human or agent — contributing to this repository. See [README.md](README.md) for what this project is and where the data is used.

## Tooling

The `research-tracker-domain` skill in `.claude/skills/` is an example of the tooling we welcome: it gathers sourced facts about a domain into a research report so the contributor can decide whether and how to add it. The contributor still reviews the findings and writes the files.

## Editing `db/`

Read [`docs/contributing.md`](docs/contributing.md) first — file formats, slug conventions, category guidance, sourcing, and duplicate avoidance. Auto-format with `node lint.js` after editing.

The rule worth restating up front: **leave a field blank rather than fill it with a value you cannot back up.**

## Before opening a pull request

```sh
npm ci
npm run lint            # ESLint over src/, test/, scripts/
npm run lint-patterns   # node lint.js --check — verifies db/ formatting
npm test
npm run build
```

## Code

The SDK in `src/` and tooling in `scripts/` are TypeScript / JavaScript on Node 20+. Follow the existing ESLint + Prettier configuration; `npm run lint-fix` applies fixes.
