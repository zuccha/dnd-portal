import type { Source } from "~/models/catalogue/source";
import type { SourceType } from "~/models/types/source-type";

//------------------------------------------------------------------------------
// Source Status
//------------------------------------------------------------------------------

export type SourceStatus = "available" | "detached" | "installed" | "local";

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
  if (source.registry) return "installed";
  if (registryLoading) return undefined;
  return registrySources.some(({ id }) => id === source.id) ? "detached" : (
      "local"
    );
}

//------------------------------------------------------------------------------
// Get Source Status Color
//------------------------------------------------------------------------------

export function getSourceStatusColor(
  status: SourceStatus,
): "blue" | "gray" | "green" | "orange" {
  switch (status) {
    case "available":
      return "gray";
    case "detached":
      return "orange";
    case "installed":
      return "green";
    case "local":
      return "blue";
  }
}

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
