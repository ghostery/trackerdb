import { FiltersEngine, Request, ENGINE_VERSION } from '@ghostery/adblocker';

export { Request as AdblockerRequest };

type FromRawDetailsParams = Parameters<typeof Request.fromRawDetails>;
type DeserializeParams = Parameters<typeof FiltersEngine.deserialize>;

export default async function loadTrackerDBEngine(
  engineBytes: DeserializeParams[0],
) {
  const engine = FiltersEngine.deserialize(engineBytes);

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
  };
}
