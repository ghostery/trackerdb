---
name: research-tracker-domain
description: Research a domain for a TrackerDB contributor — checks the database for existing coverage, investigates the operator, and produces a sourced research report plus concrete proposed file changes (snippets only). Does not write files in db/. Use when a developer wants help gathering facts about a domain before deciding whether or how to add it.
argument-hint: "<domain>"
allowed-tools: Bash, Read, WebSearch, WebFetch, Grep, Glob
---

# Research a tracker domain

Help a TrackerDB contributor decide whether and how to add a domain. Read [`docs/contributing.md`](../../../docs/contributing.md) once for field rules and slug conventions — this skill does not repeat them.

The user supplies one argument: a domain (or URL — strip to the hostname).

## What to gather

The point is to surface enough sourced fact for the contributor to make the call. The right shape of the answer depends on what you find — a domain already covered by a parent filter ends the investigation in one line; a brand-new operator with three competing legal entities deserves a longer write-up. Use judgement.

### Existing coverage in `db/`

- Exact match: `grep -rln "^<domain>$" db/patterns/`.
- Parent or sibling: `grep -rn "<apex-with-escaped-dot>" db/patterns/`. A `||<apex>^` filter in some pattern's filter block already covers every subdomain — that's full coverage. A sibling subdomain in the same apex usually means the right move is extending that file rather than starting a new one. Path-scoped or unrelated hits don't conflict but are useful evidence of operator reuse.

### Operator

Who actually runs this hostname? A few signal sources, ordered roughly by reliability:

- **DNS.** `dig <hostname> CNAME +short`, then `dig <hostname> A +short`. A CNAME into another vendor's product infrastructure (`*.adobedtm.com`, `*.tealiumiq.com`, `*.salesforce.com`, `*.segment.io`) is strong evidence that vendor operates the endpoint. Generic CDN CNAMEs (CloudFront, Akamai, Fastly, Cloudflare, Google Cloud) only tell you who hosts the bytes, not who runs the service.
- **The brand site.** `WebFetch https://<apex>/` for the company name, what the product does, and links to the privacy policy and imprint. Tracker hostnames (`static.example.io`, `metrics.example.io`) often don't render or redirect to the brand domain — fetch the brand domain directly.
- **Privacy policy and imprint.** Legal entity, jurisdiction, privacy contact. The imprint of a `.de` site is often the most reliable single source for legal domicile.
- **WHOIS.** `whois <apex>`. Usually redacted on `.com` / `.net` / `.org`, but country-code TLDs (`.de`, `.fr`, `.kr`, `.jp`, `.uk`, ...) often expose the legal entity directly.
- **Business intel.** Crunchbase, CB Insights, LinkedIn About pages, Wikipedia. Useful for parent / acquirer relationships and HQ confirmation. Often paywalled — the search-result snippet alone is sometimes enough; don't retry blocked fetches.

Cross-reference at least two sources before stating a legal entity or country. Acquired companies often look independent on the surface but roll up under a parent — Google, Meta, Adobe, Salesforce, Oracle. The parent is what should appear in `country` and `description`, not the acquired brand's old jurisdiction.

### Existing organization in `db/`

If the operator might already be in the database, the new pattern should reuse the existing slug rather than creating a duplicate org:

- `ls db/organizations/<candidate>.eno`
- `grep -il "^name: <Brand>$" db/organizations/*.eno`
- Check the parent. Acquired companies roll up: most Google acquisitions live under `google`, Meta under `facebook`, Adobe under `adobe`.
- Read the `organization:` field of any related pattern you found earlier.

A matching brand name alone is not enough — open the candidate `.eno` and confirm the legal entity is the same.

### Category

The category is the contributor's call, but a sourced suggestion is useful. Read the company's own description of the product (their site, not a third-party summary), then map it to the keys in `db/categories/`. If two categories could reasonably apply, say so and give the trade-off — the contributor will pick.

## What to produce

A markdown report the contributor can read top-to-bottom and act on. There's no fixed template — let the findings drive the shape. As a baseline, it should make these things obvious:

- whether the domain is already covered (and if so, where) — if yes, stop there
- who the operator is, with sources for the legal entity and country
- whether an existing organization in `db/` should be reused, or a new one is needed
- a category suggestion with a one-line justification
- proposed file content as fenced `eno` blocks — full final contents for new files, smallest excerpt with surrounding context for edits (never a contextless diff)
- explicit list of what you couldn't source, so the contributor knows what's still open

End with a line telling the contributor you won't write the files on your own — they review and approve.

## Constraints

- **Don't write or edit anything under `db/`.** Propose content; the contributor applies it (or asks you to in a follow-up).
- **Don't guess values you couldn't source.** Blanks are auditable; invented values get baked into a database that ships to millions of users. Call out every blank.
- **Don't decide classification for the contributor.** Suggest, justify, hand it over.
- **Don't cite Ghostery's own properties** (`whotracks.me`, `ghostery.com/whotracksme/`) — they are generated from this database, so citing them is circular.
- **Don't open a PR, commit, or push.**
- **Don't run `node lint.js`.** That's the contributor's verification step after they apply changes.
