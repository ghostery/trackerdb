import { FiltersEngine, Request, ENGINE_VERSION } from '@ghostery/adblocker';

export { Request as AdblockerRequest };

type FromRawDetailsParams = Parameters<typeof Request.fromRawDetails>;
type DeserializeParams = Parameters<typeof FiltersEngine.deserialize>;

// The parsed trackerdb.json — needed for matchCookie/matchHeader, which are not part of the
// (URL-oriented) adblocker engine binary. Its cookie/header indexes are pre-bucketed at export
// time so a match is a single hash probe (wildcards: a short trie walk) with no per-load rebuild.
export interface TrackerDBData {
  categories: Record<
    string,
    { name: string; color: string; description: string }
  >;
  organizations: Record<string, Record<string, unknown>>;
  patterns: Record<
    string,
    {
      name: string;
      category: string;
      organization: string | null;
      [key: string]: unknown;
    }
  >;
  cookies?: Record<string, string>;
  cookiePrefixes?: Record<string, string>;
  headers?: Record<string, Array<{ value: string | null; id: string }>>;
}

export interface PatternMatch {
  pattern: Record<string, unknown>;
  category: Record<string, unknown> | null;
  organization: Record<string, unknown> | null;
}

interface CookieTrieNode {
  id?: string;
  next: Map<string, CookieTrieNode>;
}

// eslint-disable-next-line @typescript-eslint/require-await
export default async function loadTrackerDBEngine(
  engineBytes: DeserializeParams[0],
  db?: TrackerDBData,
) {
  const engine = FiltersEngine.deserialize(engineBytes);

  // The only load-time build is a small trie over wildcard cookie prefixes; exact cookies and
  // header buckets are used straight from the export.
  const cookieTrie: CookieTrieNode = { next: new Map() };
  if (db && db.cookiePrefixes) {
    for (const [prefix, id] of Object.entries(db.cookiePrefixes)) {
      let node = cookieTrie;
      for (const ch of prefix) {
        let child = node.next.get(ch);
        if (!child) {
          child = { next: new Map() };
          node.next.set(ch, child);
        }
        node = child;
      }
      node.id = id;
    }
  }

  function resolve(id: string): PatternMatch | null {
    if (!db) return null;
    const pattern = db.patterns[id];
    if (!pattern) return null;
    const cat = db.categories[pattern.category];
    const orgKey = pattern.organization;
    const org = orgKey ? db.organizations[orgKey] : undefined;
    return {
      pattern: { key: id, ...pattern },
      category: cat ? { key: pattern.category, ...cat } : null,
      organization: orgKey && org ? { key: orgKey, ...org } : null,
    };
  }

  function cookiePatternId(name: string): string | null {
    const exact = db && db.cookies ? db.cookies[name] : undefined;
    if (exact) return exact;
    // Shortest registered prefix wins.
    let node: CookieTrieNode = cookieTrie;
    for (const ch of name) {
      const child = node.next.get(ch);
      if (!child) return null;
      if (child.id !== undefined) return child.id;
      node = child;
    }
    return node.id ?? null;
  }

  return {
    ENGINE_VERSION,
    engine,
    matchUrl(
      requestArgs: FromRawDetailsParams[0],
      getPatternMetadataParams = { getDomainMetadata: true },
    ) {
      const params = { ...requestArgs };
      if (params.type === undefined) {
        params.type = 'xhr';
      }
      return engine.getPatternMetadata(
        Request.fromRawDetails(params),
        getPatternMetadataParams,
      );
    },

    matchDomain(domain: string) {
      if (!engine.metadata) {
        return [];
      }
      return engine.metadata.fromDomain(domain);
    },

    // A cookie name may come from a request `Cookie`, a response `Set-Cookie`, or the jar.
    matchCookie(name: string): PatternMatch[] {
      const id = cookiePatternId(name);
      const m = id ? resolve(id) : null;
      return m ? [m] : [];
    },

    matchHeader(name: string, value?: string): PatternMatch[] {
      const bucket =
        db && db.headers ? db.headers[name.toLowerCase()] : undefined;
      if (!bucket) return [];
      const v = value === undefined ? null : String(value).toLowerCase();
      const out: PatternMatch[] = [];
      for (const hm of bucket) {
        if (hm.value !== null && (v === null || !v.includes(hm.value))) {
          continue;
        }
        const m = resolve(hm.id);
        if (m) out.push(m);
      }
      return out;
    },
  };
}
