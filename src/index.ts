import { FiltersEngine, Request, ENGINE_VERSION } from '@ghostery/adblocker';

export { Request as AdblockerRequest };

type FromRawDetailsParams = Parameters<typeof Request.fromRawDetails>;
type DeserializeParams = Parameters<typeof FiltersEngine.deserialize>;

// The parsed trackerdb.json — needed for matchCookie/matchHeader, which are not part of the
// (URL-oriented) adblocker engine binary.
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
      cookies?: string[];
      headers?: string[];
      [key: string]: unknown;
    }
  >;
}

export interface PatternMatch {
  pattern: Record<string, unknown>;
  category: Record<string, unknown> | null;
  organization: Record<string, unknown> | null;
}

// eslint-disable-next-line @typescript-eslint/require-await
export default async function loadTrackerDBEngine(
  engineBytes: DeserializeParams[0],
  db?: TrackerDBData,
) {
  const engine = FiltersEngine.deserialize(engineBytes);

  // Cookie/header lookups are built from the JSON (optional). A cookie name may come from a
  // request `Cookie`, a response `Set-Cookie`, or the jar — the matcher does not care which.
  const exactCookies = new Map<string, string>();
  const prefixCookies: Array<{ prefix: string; id: string }> = [];
  const headerMatchers: Array<{
    name: string;
    value: string | null;
    id: string;
  }> = [];

  if (db) {
    for (const id of Object.keys(db.patterns)) {
      const p = db.patterns[id];
      for (const c of p.cookies ?? []) {
        if (c.endsWith('*')) prefixCookies.push({ prefix: c.slice(0, -1), id });
        else exactCookies.set(c, id);
      }
      for (const h of p.headers ?? []) {
        const idx = h.indexOf(':');
        if (idx === -1) {
          headerMatchers.push({
            name: h.trim().toLowerCase(),
            value: null,
            id,
          });
        } else {
          headerMatchers.push({
            name: h.slice(0, idx).trim().toLowerCase(),
            value: h
              .slice(idx + 1)
              .trim()
              .toLowerCase(),
            id,
          });
        }
      }
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
    const hit = exactCookies.get(name);
    if (hit) return hit;
    for (const { prefix, id } of prefixCookies) {
      if (name.startsWith(prefix)) return id;
    }
    return null;
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

    matchCookie(name: string): PatternMatch[] {
      const id = cookiePatternId(name);
      const m = id ? resolve(id) : null;
      return m ? [m] : [];
    },

    matchHeader(name: string, value?: string): PatternMatch[] {
      const n = name.toLowerCase();
      const v = value === undefined ? null : String(value).toLowerCase();
      const out: PatternMatch[] = [];
      for (const hm of headerMatchers) {
        if (hm.name !== n) continue;
        if (hm.value !== null && (v === null || !v.includes(hm.value)))
          continue;
        const m = resolve(hm.id);
        if (m) out.push(m);
      }
      return out;
    },
  };
}
