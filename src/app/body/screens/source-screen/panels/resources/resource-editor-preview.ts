import type { Resource } from "~/models/resources/resource";

//------------------------------------------------------------------------------
// Resource Editor Preview Patch
//------------------------------------------------------------------------------

export type ResourceEditorPreviewPatch = {
  resource: Record<string, unknown>;
  translation: Record<string, unknown>;
};

//------------------------------------------------------------------------------
// Apply Resource Editor Preview Patch
//------------------------------------------------------------------------------

export function applyResourceEditorPreviewPatch<R extends Resource>(
  resource: R,
  lang: string,
  patch: ResourceEditorPreviewPatch,
): R {
  const nextResource: Record<string, unknown> = structuredClone(resource);

  for (const [key, value] of Object.entries(patch.resource)) {
    if (value !== undefined) nextResource[key] = value;
  }

  for (const [key, value] of Object.entries(patch.translation)) {
    if (value === undefined) continue;

    const previous = nextResource[key];
    const translations =
      previous && typeof previous === "object" && !Array.isArray(previous) ?
        { ...(previous as Record<string, unknown>) }
      : {};

    translations[lang] = value;
    nextResource[key] = translations;
  }

  return nextResource as R;
}
