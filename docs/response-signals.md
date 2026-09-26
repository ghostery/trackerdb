# Cookies & headers

Besides `domains` and `filters` (which match a request by its **URL**), a pattern can also match
on **cookies** and **response headers** — identifying a vendor the URL can't reveal, for example a
CNAME-cloaked first-party subdomain that is really Cloudflare or DataDome.

Two optional, alphabetically-sorted blocks (order is enforced by `npm run lint-patterns`):

```
--- cookies
cf_clearance
incap_ses_*
--- cookies

--- headers
cf-ray
server: cloudflare
--- headers
```

- **cookies** — a cookie *name*, matched wherever it appears (`Set-Cookie`, the request
  `Cookie` header, or the cookie jar). A trailing `*` is a prefix wildcard (`incap_ses_*`, `__ddg*`).
- **headers** — a response header as `name` (presence) or `name: value` (value matched
  case-insensitively as a substring).

**Only add vendor-unique names.** Generic signals like `PHPSESSID`, `sid`, `csrf` or
`server: nginx` match half the web — never list them.

A pattern may be matched by cookies/headers alone, with no `domains` — that is the point for
CNAME-cloaked vendors.

## Matching from code

`matchCookie` / `matchHeader` live on the same matcher as `matchUrl` / `matchDomain`. They are
powered by the exported `trackerdb.json` (not the engine binary), so pass it as the second
argument to `loadTrackerDB`:

```js
import loadTrackerDB from '@ghostery/trackerdb';

const trackerDB = await loadTrackerDB(engineBytes, trackerDBJson);

trackerDB.matchCookie('incap_ses_812_99');      // exact or prefix-wildcard
trackerDB.matchHeader('cf-ray');                // header presence
trackerDB.matchHeader('server', 'cloudflare');  // header name + value
// → [{ pattern, category, organization }, ...]
```
