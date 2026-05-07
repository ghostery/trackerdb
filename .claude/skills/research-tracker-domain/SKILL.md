---
name: research-tracker-domain
description: Research a domain for a TrackerDB contributor — checks the database for existing coverage, investigates the operator, and produces a sourced research report plus concrete proposed file changes (snippets only). Does not write files in db/. Use when a developer wants help gathering facts about a domain before deciding whether or how to add it.
argument-hint: "<domain>"
allowed-tools: Bash, Read, WebSearch, WebFetch, Grep, Glob
---

# Research a tracker domain

Helper for TrackerDB developers. Gathers facts about a domain and turns them into a concrete proposal: which file to create or edit and what content to put in it. **You do not write files in `db/`** and **you do not decide classification on the contributor's behalf** — the proposal is reviewed and applied by the contributor (or by you in a follow-up turn after they approve). The database structure, field rules, and slug conventions live in [`docs/contributing.md`](../../../docs/contributing.md) and the category list in [`docs/categories.md`](../../../docs/categories.md); read both once so your report uses the same vocabulary.

The user supplies one argument: a domain (or URL — strip to the hostname).

## Research checklist

Run independent steps in parallel.

### 1. Existing coverage

- **Exact match:** `grep -rln "^<domain>$" db/patterns/`. If hit, the domain is already in the database — report which pattern and stop with no proposed change.
- **Parent coverage:** an existing pattern's `||<apex>^` filter covers all subdomains. `grep -rn "<apex-with-escaped-dot>" db/patterns/`. Flag `||<parent>^` filters as full coverage; path-scoped or sibling-subdomain hits don't conflict but are useful evidence for organization reuse.
- **Sibling subdomain:** if another subdomain of the same apex is already in a pattern, the proposal is almost always to extend that file rather than create a new one.

### 2. Operator

- `dig <hostname> CNAME +short` and `dig <hostname> A +short`. CNAMEs into another vendor's infrastructure (`*.adobedtm.com`, `*.tealiumiq.com`, `*.salesforce.com`) suggest ownership; generic CDN CNAMEs (CloudFront, Akamai, Fastly, Cloudflare) only mean hosting.
- `whois <apex>`. Usually redacted on `.com`/`.net`/`.org`, but ccTLDs (`.de`, `.fr`, `.kr`, `.jp`, `.uk`, ...) often expose the legal entity directly.
- `WebFetch https://<apex>/` for company name, what the service does, and links to privacy policy and contact. Tracker hostnames (`static.example.io`) often don't render — fetch the brand domain instead.
- Privacy policy: `WebSearch "<company>" privacy policy` then `WebFetch` for legal entity name, jurisdiction, contact email.
- Business intelligence for HQ and parent / acquirer: Crunchbase, CB Insights, LinkedIn About pages. Often paywalled; the search-result snippet alone is sometimes enough. Don't retry blocked fetches.
- Cross-reference with the company's About page and Wikipedia.

**Don't cite Ghostery's own properties** (`whotracks.me`, `ghostery.com/whotracksme/`) — they are generated from this database, so citing them is circular.

### 3. Existing organization

If the operator might already be in the database:

1. By slug: `ls db/organizations/<candidate>.eno`.
2. By name: `grep -il "^name: <Brand>$" db/organizations/*.eno`.
3. By parent (acquired companies often roll up): `grep -il "^name: <Parent>" db/organizations/*.eno`. Acquired by Google → `google`; by Meta → `facebook`; by Adobe → `adobe`.
4. By sibling pattern: read a related pattern's `organization:` field.

When a lookup matches, open the organization file and confirm the legal entity is the same — a matching brand name alone is not enough.

### 4. Decide the change shape

Pick exactly one of these scenarios; it dictates the Proposed changes section:

- **A — already covered.** Exact match or `||<apex>^` parent filter. No file changes. Report and stop.
- **B — extend an existing pattern.** A sibling subdomain pattern exists and the new domain belongs to the same product. Propose adding the hostname to that file's `--- domains` block (in alphabetical order, matching the file's existing convention).
- **C — new pattern, existing organization.** The operator already has an organization file but no pattern fits. Propose a new `db/patterns/<slug>.eno` file pointing at the existing `organization:` slug.
- **D — new pattern + new organization.** Operator is not in the database. Propose both a new `db/organizations/<slug>.eno` and a new `db/patterns/<slug>.eno`.

### 5. Slug

Apply the rules in [`docs/contributing.md` § Slug naming](../../../docs/contributing.md#slug-naming) and check for collisions: `ls db/organizations/<slug>.eno db/patterns/<slug>.eno`.

## Output format

Produce a single markdown report. Be concise — one or two lines per bullet. Leave a value blank when you have no source for it; do not guess.

```
# Research: <domain>

## Existing coverage
- one of:
  - not present in db/
  - already covered by `||<apex>^` in db/patterns/<file>.eno (no new entry needed) — scenario A
  - sibling subdomain in db/patterns/<file>.eno — scenario B
  - operator already in db/organizations/<slug>.eno but no matching pattern — scenario C
  - operator not in db/ — scenario D

## Operator
- Brand / product name: ...
- Legal entity: ...
- Country (legal domicile, ISO 3166-1 alpha-2): ...
- Parent or acquirer: ... (if any)
- Privacy policy URL: ...
- Privacy contact: ...

## Suggested category
One category from docs/categories.md, with a one-line justification. Mention the runner-up if it's close. Final pick is the contributor's call.

## Existing organization to consider reusing
- `<slug>` (db/organizations/<slug>.eno) — same legal entity, confirmed by <source>
- or: none found; a new organization file is included in the proposal below.

## Proposed changes

For scenario A, write: "No changes — already covered."

For scenarios B / C / D, list each file under its own subheading. Use ✏️ for an edit, ➕ for a new file. Show the **full proposed final contents** of the file in a fenced block (or, for an edit, the smallest contiguous excerpt that includes the change with a few lines of surrounding context). Do not show diffs without context.

### ✏️ db/patterns/<existing>.eno
```eno
<final contents or excerpt>
```

### ➕ db/patterns/<new-slug>.eno
```eno
name: <Product Name>
category: <suggested-category>
website_url: <product page>
organization: <existing-or-new-slug>

--- domains
<domain>
--- domains

--- notes
Sources:
- name, website_url: <URL>
- category: <reasoning + URL>
- organization: reused existing slug, confirmed by <source>
--- notes
```

### ➕ db/organizations/<new-slug>.eno   (scenario D only)
```eno
name: <Legal Entity>
website_url: <corporate root, https, trailing slash>
privacy_policy_url: <or blank>
privacy_contact: <or blank>
country: <ISO alpha-2, legal domicile>
description: <one to three factual sentences>
```

After the proposal, add a one-line apply hint:

> Apply: review above, then ask me to write these files. I will not write them on my own.

## Sources
- <field or facts>: <URL or command>
- (one line per non-trivial claim)

## Open questions
- (anything you could not resolve — blank fields in the proposal, ambiguous category, apex-vs-subdomain scope, etc.)
```

### Rules for the proposed snippets

- **Leave fields blank rather than guess.** A blank `privacy_contact:` is fine; an invented one is not. Mirror every blank in Open questions.
- **Order entries inside `--- domains` alphabetically** unless the existing file uses a different convention; match the file you are editing.
- **Include a `--- notes` block** in any new pattern or organization file, citing the source per non-trivial field. This is required by `docs/contributing.md`.
- **Do not add `--- filters`** unless the research clearly justifies it (shared hostname, third-party-only behaviour). Domains-only is the default.
- **Do not invent categories or tags.** Use the lists in `docs/categories.md` (categories) and `docs/contributing.md` (tags).
- **Do not propose unrelated edits** to existing files — only the one line / block needed for this domain.

## Don't

- **Don't write files in `db/`.** Suggesting content in the report is fine; running `Write` or `Edit` on anything under `db/` is not. Wait for the contributor to approve.
- **Don't fill values you cannot source.** If you cannot find a source for a fact in this session, leave it blank in the proposal and list it under Open questions.
- **Don't decide classification for the contributor.** Suggest a category with a justification and call out a close runner-up; let the contributor make the call.
- **Don't open a PR, commit, or push.**
- **Don't run `node lint.js`.** That is the contributor's verification step after they apply changes.
