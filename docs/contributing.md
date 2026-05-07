# Contributing to TrackerDB

This data ships in the Ghostery extension and powers [WhoTracks.me](https://whotracks.me/), so accuracy beats coverage. A missing entry leaves a request unclassified; a wrong entry mislabels it for millions of users. **Prefer leaving a field blank to filling it with a value you cannot back up.**

The common contribution is adding a tracker domain. Skim a few existing files in `db/organizations/` and `db/patterns/` first — they are the canonical examples.

## Files

A pattern (`db/patterns/<slug>.eno`) points at exactly one organization (`db/organizations/<slug>.eno`) via its `organization:` field. **One organization commonly has many patterns** — `google` is referenced by 60+. Most contributions only add a pattern.

The files use [eno](https://eno-lang.org/). `node lint.js` preserves only `key: value` lines and `--- section` blocks; anything else is stripped.

A few rules are not obvious from the examples:

- **`country` is the legal domicile**, not where engineers sit or servers are hosted. ISO 3166-1 alpha-2, taken from the privacy policy or imprint.
- **`description` is factual.** No marketing language, no editorial judgement (`invasive`, `shady`).
- **`category` must come from `db/categories/`** — read the company's *own* description, then pick from [`docs/categories.md`](categories.md), which also covers edge cases. Don't invent new ones.
- **`tags` are limited to** `site-statistics`, `cross-site`, `passive-statistics`, `anti-fraud`. Omit the line if none apply.
- **The `--- domains` block already blocks all listed hostnames.** Add `--- filters` only when the hostname is shared between tracking and non-tracking traffic, or when behaviour is third-party-only (`||example.com^$3p`). Domains-only is the safe default.

## Sourcing

Cite where each non-trivial value came from in a `--- notes` block at the bottom of the file:

```
--- notes
Sources:
- name, description: https://www.bytedance.com/en/ + https://en.wikipedia.org/wiki/ByteDance
- country (KY): privacy policy footer "ByteDance Ltd., Cayman Islands"
--- notes
```

If a field is blank because no source was found, say so — it makes the absence auditable.

**Don't cite Ghostery's own properties** (`whotracks.me`, `ghostery.com/whotracksme/`). They are generated from this database, so citing them is circular and reinforces existing mistakes.

## Slug naming

- Lowercase, snake_case. Replace `.` and `-` with `_`.
- Drop the TLD when the brand reads better without it: `Dable` → `dable`; `eclick.vn` → `eclick`.
- For single-product companies, pattern slug equals organization slug.
- When one organization has many patterns, name the pattern after the product (`google_analytics`, `google_tag_manager`).
- Check for collisions: `ls db/organizations/<candidate>.eno db/patterns/<candidate>.eno`.

## Researching the operator

Before writing, find out who actually operates the domain:

- The company's **privacy policy** and imprint — legal entity, jurisdiction, contact email.
- **DNS.** `dig <hostname> CNAME +short`. A CNAME into another vendor's infrastructure (`*.adobedtm.com`, `*.salesforce.com`, `*.tealiumiq.com`) is strong evidence of ownership; generic CDN CNAMEs (CloudFront, Akamai, Fastly, Cloudflare) only mean hosting.
- **WHOIS.** Usually redacted on `.com`/`.net`/`.org`, but ccTLDs (`.de`, `.fr`, `.kr`, `.jp`, `.uk`) often expose the legal entity directly.
- Crunchbase, CB Insights, LinkedIn About — for HQ and parent / acquirer. Often paywalled; the search snippet alone is sometimes enough.

## Reusing an existing organization

If the operator's company is already in the database, **don't create a second organization** — point your new pattern at the existing slug. Look for a match by:

1. Slug: `ls db/organizations/<candidate>.eno`.
2. Name: `grep -il "^name: <Brand>$" db/organizations/*.eno`.
3. Parent. Acquired companies often roll up — Google → `google`; Meta → `facebook`; Adobe → `adobe`.
4. Sibling pattern: read its `organization:` field.

Confirm the legal entity is the same — a matching brand name alone is not enough.

## Avoiding duplicates

- Exact match: `grep -rln "^<domain>$" db/patterns/`.
- Parent coverage: `||example.com^` matches all subdomains. `grep -rn "<apex>" db/patterns/` and inspect — `||<parent>^` filters cover your domain; path-scoped or sibling-subdomain ones do not.

If the domain is already covered, extend the existing pattern (or open an issue) rather than creating a new one.

## Verifying

```sh
node lint.js
```

Auto-formats files in `db/` and flags common mistakes — expensive regex filters, missing section terminators, untokenisable filters. Run with `--check` to confirm a clean tree.
