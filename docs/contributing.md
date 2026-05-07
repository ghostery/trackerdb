# Contributing to TrackerDB

This data ships in the Ghostery extension and powers [WhoTracks.me](https://whotracks.me/), so accuracy beats coverage. **Prefer leaving a field blank to filling it with a value you cannot back up.**

The common contribution is a new tracker domain. Open a few files in `db/organizations/` and `db/patterns/` first — they are the canonical examples, and most rules are obvious from them. The non-obvious bits:

- A pattern's `organization:` field points at one org; one org commonly has many patterns (`google` is referenced by 60+).
- `country` is the **legal domicile** (ISO 3166-1 alpha-2), not where engineers sit. Take it from the privacy policy or imprint.
- `description` is factual — no marketing language, no editorial judgement.
- `category` keys come from `db/categories/`; don't invent new ones.
- `tags` accepts only `site-statistics`, `cross-site`, `passive-statistics`, `anti-fraud`. Omit otherwise.
- The `--- domains` block already blocks every listed hostname. Add `--- filters` only when a hostname is shared between tracking and non-tracking traffic, or when behaviour is third-party-only (`||example.com^$3p`).
- Cite each non-trivial value in a `--- notes` block — except Ghostery's own properties (`whotracks.me`, `ghostery.com/whotracksme/`), which are generated from this database and would be circular.

## Slugs

Lowercase, snake_case (replace `.` and `-` with `_`). Drop the TLD when the brand reads better: `Dable` → `dable`. For multi-product organizations, name the pattern after the product (`google_analytics`, `google_tag_manager`). Check collisions: `ls db/organizations/<slug>.eno db/patterns/<slug>.eno`.

## Before adding an organization

If the operator is already in the database, point your new pattern at the existing slug rather than creating a duplicate. Acquired companies often roll up — Google → `google`, Meta → `facebook`, Adobe → `adobe`. Confirm by legal entity, not just brand name:

```sh
ls db/organizations/<candidate>.eno
grep -il "^name: <Brand>$" db/organizations/*.eno
```

## Before adding a pattern

Make sure the domain isn't already covered:

```sh
grep -rln "^<domain>$" db/patterns/      # exact match
grep -rn "<apex>" db/patterns/           # parent / sibling coverage
```

A `||<apex>^` filter in an existing pattern already covers all subdomains.

## Verifying

```sh
node lint.js
```

Auto-formats files in `db/` and flags common mistakes. Pass `--check` to verify without writing.
