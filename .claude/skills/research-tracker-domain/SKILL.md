---
name: research-tracker-domain
description: Research a domain for a TrackerDB contributor — checks the database for existing coverage, investigates the operator, and produces a sourced research report plus concrete proposed file changes (snippets only). Does not write files in db/. Use when a developer wants help gathering facts about a domain before deciding whether or how to add it.
argument-hint: "<domain>"
allowed-tools: Bash, Read, WebSearch, WebFetch, Grep, Glob
---

# Research a tracker domain

Helper for TrackerDB contributors. Gathers sourced facts about a domain and proposes concrete file content. **Read [`docs/contributing.md`](../../../docs/contributing.md) once** for field rules and slug conventions; this skill does not repeat them.

**You do not write files in `db/`.** Propose content in the report; the contributor applies it (or asks you to in a follow-up).

The user supplies one argument: a domain (or URL — strip to the hostname).

## Investigate

Run independent steps in parallel.

**Existing coverage.** Stop early if already covered.
- Exact: `grep -rln "^<domain>$" db/patterns/`.
- Parent / sibling: `grep -rn "<apex-with-escaped-dot>" db/patterns/`. A `||<apex>^` filter covers all subdomains; a sibling-subdomain hit means you should probably extend that file rather than create a new one.

**Operator.**
- `dig <hostname> CNAME +short` — CNAMEs into vendor infrastructure (`*.adobedtm.com`, `*.tealiumiq.com`, `*.salesforce.com`) suggest ownership; generic CDNs (CloudFront, Akamai, Fastly, Cloudflare) only mean hosting.
- `whois <apex>` — usually redacted on gTLDs but ccTLDs (`.de`, `.fr`, `.kr`, `.jp`, `.uk`) often expose the legal entity.
- `WebFetch` the brand site (`https://<apex>/`) and the privacy policy for legal entity, jurisdiction, contact email. Tracker hostnames often don't render — fetch the brand domain.
- Crunchbase / LinkedIn for parent or acquirer. Often paywalled; the search snippet is sometimes enough. Don't retry blocked fetches.

**Existing organization.** If the operator might already be in the database:
- `ls db/organizations/<candidate>.eno`
- `grep -il "^name: <Brand>$" db/organizations/*.eno`
- Check the parent (acquired companies roll up: Google → `google`, Meta → `facebook`, Adobe → `adobe`).
- Read a sibling pattern's `organization:` field.

Confirm by legal entity, not brand name alone.

## Decide the change shape

Pick exactly one:
- **A — already covered.** No file changes. Report and stop.
- **B — extend an existing pattern.** Add the hostname to its `--- domains` block.
- **C — new pattern, existing organization.** New `db/patterns/<slug>.eno` pointing at the existing org slug.
- **D — new pattern + new organization.**

## Report

Single markdown report. One or two lines per bullet. Leave values blank when unsourced — never guess. Mirror every blank in **Open questions**.

```
# Research: <domain>

## Existing coverage
<scenario A/B/C/D, with a one-line citation if a file already references this apex>

## Operator
- Brand / product: ...
- Legal entity: ...
- Country (legal domicile, ISO 3166-1 alpha-2): ...
- Parent or acquirer: ...
- Privacy policy URL: ...
- Privacy contact: ...

## Suggested category
One key from db/categories/, with a one-line justification. Mention a close runner-up. Final pick is the contributor's call.

## Existing organization to reuse
- `<slug>` (db/organizations/<slug>.eno) — same legal entity, confirmed by <source>
- or: none; a new organization is included below.

## Proposed changes

For scenario A: "No changes — already covered."

For B/C/D, list each file under its own subheading (✏️ edit, ➕ new). Show full final contents in a fenced ```eno block (or, for an edit, the smallest excerpt with surrounding context — never a contextless diff). Pattern files need a `--- notes` block citing each non-trivial field. Add `--- filters` only when the research justifies it.

> Apply: review above, then ask me to write these files. I will not write them on my own.

## Sources
- <field>: <URL or command>

## Open questions
- <anything unresolved or left blank>
```

## Don't

- Write or edit anything under `db/`.
- Fill values you cannot source. Blanks are auditable; invented values are not.
- Decide classification on the contributor's behalf.
- Cite Ghostery's own properties (`whotracks.me`, `ghostery.com/whotracksme/`) — generated from this database, so it's circular.
- Open a PR, commit, or push.
- Run `node lint.js` — that's the contributor's verification step after they apply changes.
