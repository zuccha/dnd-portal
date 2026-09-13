import {
  type Source,
  type SourceDependency,
  sourceSchema,
} from "~/models/catalogue/source";
import {
  type SourceBundleWithoutRegistry,
  sourceBundleWithoutRegistrySchema,
} from "~/models/catalogue/source-bundle";
import supabase from "~/supabase";

const registryBundleBucket = "registry-bundles";

//------------------------------------------------------------------------------
// Registry Sources
//------------------------------------------------------------------------------

export async function fetchRegistrySources(): Promise<Source[]> {
  const { data, error } = await supabase.rpc("fetch_registry_sources");

  if (error)
    throw new Error(`Registry sources request failed: ${error.message}`);

  return sourceSchema.array().parse(data);
}

//------------------------------------------------------------------------------
// Registry Source Dependency Analysis
//------------------------------------------------------------------------------

export type RegistrySourceDependencyAnalysis = {
  missingDependencies: SourceDependency[];
  registryDependencies: Source[];
  registrySourceIds: string[];
};

export function analyzeRegistrySourceDependencies(
  source: Source,
  registrySources: Source[],
  installedSourceIds: ReadonlySet<string>,
): RegistrySourceDependencyAnalysis {
  const registrySourceById = new Map(
    registrySources.map((registrySource) => [
      registrySource.id,
      registrySource,
    ]),
  );
  const pendingSources = [source];
  const analyzedSourceIds = new Set<string>();
  const missingDependencyIds = new Set<string>();
  const missingDependencies: SourceDependency[] = [];
  const registryDependencies: Source[] = [];
  const registrySourceIds: string[] = [];

  while (pendingSources.length) {
    const currentSource = pendingSources.shift();
    if (!currentSource || analyzedSourceIds.has(currentSource.id)) continue;
    analyzedSourceIds.add(currentSource.id);

    for (const dependency of [
      ...currentSource.includes,
      ...currentSource.requires,
    ]) {
      const registrySourceId =
        registrySourceById.has(dependency.source_id) ?
          dependency.source_id
        : undefined;

      if (registrySourceId) {
        const registrySource = registrySourceById.get(registrySourceId);
        if (!registrySource) {
          if (!missingDependencyIds.has(dependency.source_id)) {
            missingDependencyIds.add(dependency.source_id);
            missingDependencies.push(dependency);
          }
          continue;
        }

        if (
          registrySource.id !== source.id &&
          !installedSourceIds.has(registrySource.id) &&
          !registrySourceIds.includes(registrySource.id)
        ) {
          registrySourceIds.push(registrySource.id);
          registryDependencies.push(registrySource);
        }

        pendingSources.push(registrySource);
        continue;
      }

      if (
        dependency.source_id !== source.id &&
        !installedSourceIds.has(dependency.source_id) &&
        !missingDependencyIds.has(dependency.source_id)
      ) {
        missingDependencyIds.add(dependency.source_id);
        missingDependencies.push(dependency);
      }
    }
  }

  return {
    missingDependencies,
    registryDependencies,
    registrySourceIds,
  };
}

//------------------------------------------------------------------------------
// Registry Source Bundle
//------------------------------------------------------------------------------

export async function fetchRegistrySourceBundle(
  sourceId: string,
): Promise<SourceBundleWithoutRegistry> {
  const path = `sources/${sourceId}/bundle.json`;
  const { data, error } = await supabase.storage
    .from(registryBundleBucket)
    .download(path);

  if (error)
    throw new Error(`Registry bundle download failed: ${error.message}`);

  return sourceBundleWithoutRegistrySchema.parse(JSON.parse(await data.text()));
}

//------------------------------------------------------------------------------
// Fetch Registry Source Bundles
//------------------------------------------------------------------------------

export async function fetchRegistrySourceBundles(
  sourceIds: string[],
): Promise<SourceBundleWithoutRegistry[]> {
  return Promise.all(sourceIds.map(fetchRegistrySourceBundle));
}
