import { type Source, type SourceDependency, sourceSchema } from "~/models/catalogue/source";
import {
  type SourceBundle,
  type SourceBundleWithoutRegistry,
} from "~/models/catalogue/source-bundle";
import { parseSourceBundleWithoutRegistry } from "~/models/catalogue/source-bundle-migrations/migrate-source-bundle";
import supabase from "~/supabase";

const registryBundleBucket = "registry-bundles";

//------------------------------------------------------------------------------
// Can Register Registry Source
//------------------------------------------------------------------------------

export async function canRegisterRegistrySource(): Promise<boolean> {
  const { data, error } = await supabase.rpc("can_register_registry_source");

  if (error)
    throw new Error(`Registry source registration permission request failed: ${error.message}`);

  return data;
}

//------------------------------------------------------------------------------
// Registry Source Access
//------------------------------------------------------------------------------

export type RegistrySourceAccess = {
  access: "read" | "write";
  email: string;
  granted_at: string;
  user_id: string;
};

//------------------------------------------------------------------------------
// Update Registry Source Visibility
//------------------------------------------------------------------------------

export async function updateRegistrySourceVisibility(
  sourceId: string,
  visibility: "public" | "private",
): Promise<void> {
  const { error } = await supabase.rpc("update_registry_source_visibility", {
    p_source_id: sourceId,
    p_visibility: visibility,
  });

  if (error) throw new Error(`Registry source visibility update failed: ${error.message}`);
}

//------------------------------------------------------------------------------
// Fetch Registry Source Access
//------------------------------------------------------------------------------

export async function fetchRegistrySourceAccess(sourceId: string): Promise<RegistrySourceAccess[]> {
  const { data, error } = await supabase.rpc("fetch_registry_source_access", {
    p_source_id: sourceId,
  });

  if (error) throw new Error(`Registry source access request failed: ${error.message}`);

  return data as RegistrySourceAccess[];
}

//------------------------------------------------------------------------------
// Grant Registry Source Access
//------------------------------------------------------------------------------

export async function grantRegistrySourceAccess(
  sourceId: string,
  email: string,
  access: "read" | "write",
): Promise<void> {
  const { error } = await supabase.rpc("grant_registry_source_access", {
    p_access: access,
    p_email: email,
    p_source_id: sourceId,
  });

  if (error) throw new Error(`Registry source access grant failed: ${error.message}`);
}

//------------------------------------------------------------------------------
// Revoke Registry Source Access
//------------------------------------------------------------------------------

export async function revokeRegistrySourceAccess(sourceId: string, userId: string): Promise<void> {
  const { error } = await supabase.rpc("revoke_registry_source_access", {
    p_source_id: sourceId,
    p_user_id: userId,
  });

  if (error) throw new Error(`Registry source access revoke failed: ${error.message}`);
}

//------------------------------------------------------------------------------
// Registry Sources
//------------------------------------------------------------------------------

export async function fetchRegistrySources(): Promise<Source[]> {
  const { data, error } = await supabase.rpc("fetch_registry_sources");

  if (error) throw new Error(`Registry sources request failed: ${error.message}`);

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
    registrySources.map((registrySource) => [registrySource.id, registrySource]),
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

    for (const dependency of [...currentSource.includes, ...currentSource.requires]) {
      const registrySourceId = registrySourceById.has(dependency.source_id)
        ? dependency.source_id
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
  const { data, error } = await supabase.storage.from(registryBundleBucket).download(path);

  if (error) throw new Error(`Registry bundle download failed: ${error.message}`);

  return parseSourceBundleWithoutRegistry(JSON.parse(await data.text()));
}

//------------------------------------------------------------------------------
// Fetch Registry Source Bundles
//------------------------------------------------------------------------------

export async function fetchRegistrySourceBundles(
  sourceIds: string[],
): Promise<SourceBundleWithoutRegistry[]> {
  return Promise.all(sourceIds.map(fetchRegistrySourceBundle));
}

//------------------------------------------------------------------------------
// Publish Registry Source Bundle
//------------------------------------------------------------------------------

export async function publishRegistrySourceBundle(bundle: SourceBundle): Promise<void> {
  const registry = bundle.source.registry;
  if (!registry) throw new Error("Source is not registered");

  const { registry: _registry, ...source } = bundle.source;
  const { error } = await supabase.functions.invoke("publish-registry-source", {
    body: {
      base_revision_id: registry.revision_id,
      bundle: { ...bundle, source },
      source_id: bundle.source.id,
    },
  });

  if (error) throw new Error(`Registry source publish failed: ${error.message}`);
}

//------------------------------------------------------------------------------
// Register Registry Source Bundle
//------------------------------------------------------------------------------

export async function registerRegistrySourceBundle(bundle: SourceBundle): Promise<void> {
  const { registry: _registry, ...source } = bundle.source;
  const { error } = await supabase.functions.invoke("register-registry-source", {
    body: {
      bundle: { ...bundle, source },
      source_id: bundle.source.id,
    },
  });

  if (error) throw new Error(`Registry source registration failed: ${error.message}`);
}
