import {
  type Source,
  type SourceDependency,
  sourceSchema,
} from "~/models/catalogue/source";
import {
  type SourceBundle,
  sourceBundleSchema,
} from "~/models/catalogue/source-bundle";
import supabase from "~/supabase";

//------------------------------------------------------------------------------
// Registry Configuration
//------------------------------------------------------------------------------

const registryUrl = import.meta.env["VITE_REGISTRY_URL"];
const registryBundleBucket = "registry-bundles";

//------------------------------------------------------------------------------
// Registry Request
//------------------------------------------------------------------------------

async function registryRequest(path: string): Promise<unknown> {
  if (!registryUrl) throw new Error("VITE_REGISTRY_URL is not configured");

  const response = await fetch(`${registryUrl}${path}`);
  if (!response.ok)
    throw new Error(`Registry request failed: ${response.status}`);

  return response.json();
}

//------------------------------------------------------------------------------
// Registry Sources
//------------------------------------------------------------------------------

export async function fetchRegistrySources(): Promise<Source[]> {
  return sourceSchema.array().parse(await registryRequest("/registry/sources"));
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
        dependency.registry_source_id ??
        (registrySourceById.has(dependency.source_id) ?
          dependency.source_id
        : undefined);

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
): Promise<SourceBundle> {
  const path = `sources/${sourceId}/bundle.json`;
  const { data, error } = await supabase.storage
    .from(registryBundleBucket)
    .download(path);

  if (error)
    throw new Error(`Registry bundle download failed: ${error.message}`);

  return sourceBundleSchema.parse(JSON.parse(await data.text()));
}

//------------------------------------------------------------------------------
// Fetch Registry Source Bundles
//------------------------------------------------------------------------------

export async function fetchRegistrySourceBundles(
  sourceIds: string[],
): Promise<SourceBundle[]> {
  return Promise.all(sourceIds.map(fetchRegistrySourceBundle));
}
