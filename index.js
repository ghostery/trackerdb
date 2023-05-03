import { readFileSync } from 'node:fs';
import { FiltersEngine, Request, ENGINE_VERSION } from '@cliqz/adblocker';

import { generateEngine } from './src/prepare.js';

export { Request as AdblockerRequest };

export default async function loadTrackerDBEngine() {
  const trackerEnginePath = await generateEngine();
  const engine = FiltersEngine.deserialize(readFileSync(trackerEnginePath));
  return {
    ENGINE_VERSION,
    engine,
    matchUrl(
      requestArgs,
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
    matchDomain(domain) {
      return engine.metadata.fromDomain(domain);
    },
  };
}
