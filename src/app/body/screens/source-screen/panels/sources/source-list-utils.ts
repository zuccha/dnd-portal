import type { Source } from "~/models/catalogue/source";
import type { SourceType } from "~/models/types/source-type";

//------------------------------------------------------------------------------
// Source Status
//------------------------------------------------------------------------------

export type SourceStatus =
  | "available"
  | "detached"
  | "installed"
  | "local"
  | "update";

//------------------------------------------------------------------------------
// Source List Entry
//------------------------------------------------------------------------------

export type SourceListEntry = {
  source: Source;
  status: SourceStatus | undefined;
};

//------------------------------------------------------------------------------
// Source Group
//------------------------------------------------------------------------------

export type SourceGroup = {
  sources: SourceListEntry[];
  type: SourceType;
};

//------------------------------------------------------------------------------
// Create Source List Entry
//------------------------------------------------------------------------------

export function createSourceListEntry(
  source: Source,
  status: SourceStatus | undefined,
): SourceListEntry {
  return { source, status };
}

//------------------------------------------------------------------------------
// Get Local Source Status
//------------------------------------------------------------------------------

export function getLocalSourceStatus(
  source: Source,
  registrySources: Source[],
  registryLoading: boolean,
): SourceStatus | undefined {
  const registrySource = registrySources.find(({ id }) => id === source.id);

  if (source.registry)
    return registrySource && isRegistryUpdateAvailable(source, registrySource) ?
        "update"
      : "installed";
  if (registryLoading) return undefined;
  return registrySource ? "detached" : "local";
}

//------------------------------------------------------------------------------
// Get Installed Source Status
//------------------------------------------------------------------------------

export function getInstalledSourceStatus(
  source: Source,
  registrySource: Source,
): SourceStatus {
  return isRegistryUpdateAvailable(source, registrySource) ? "update" : (
      "installed"
    );
}

//------------------------------------------------------------------------------
// Is Registry Update Available
//------------------------------------------------------------------------------

function isRegistryUpdateAvailable(
  source: Source,
  registrySource: Source,
): boolean {
  return Boolean(
    source.registry &&
    registrySource.registry &&
    registrySource.registry.revision_number > source.registry.revision_number,
  );
}

//------------------------------------------------------------------------------
// Get Source Status Color
//------------------------------------------------------------------------------

export const colorBySourceStatus = {
  available: "gray",
  detached: "orange",
  installed: "green",
  local: "blue",
  update: "yellow",
} as const;

//------------------------------------------------------------------------------
// Group Sources By Type
//------------------------------------------------------------------------------

export function groupSourcesByType(
  sources: SourceListEntry[],
  lang: string,
): SourceGroup[] {
  const sourceTypes: SourceType[] = ["core", "module", "campaign"];

  return sourceTypes.flatMap((type) => {
    const groupSources = sources
      .filter(({ source }) => source.type === type)
      .sort((a, b) => compareSources(lang)(a.source, b.source));

    return groupSources.length ? [{ sources: groupSources, type }] : [];
  });
}

//------------------------------------------------------------------------------
// Compare Sources
//------------------------------------------------------------------------------

function compareSources(lang: string): (a: Source, b: Source) => number {
  return (a, b) => {
    const nameA = a.name[lang] || a.code;
    const nameB = b.name[lang] || b.code;
    return nameA.localeCompare(nameB) || a.code.localeCompare(b.code);
  };
}
