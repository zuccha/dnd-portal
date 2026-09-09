import type { Resource, TranslationFields } from "./resource";

//------------------------------------------------------------------------------
// Merge Resource Patch
//------------------------------------------------------------------------------

export function mergeResourcePatch<R extends Resource>(
  resource: R,
  patch: Partial<R>,
  translationFields: TranslationFields<R>[],
): R {
  const next = { ...resource, ...patch };

  for (const field of translationFields) {
    if (patch[field] === undefined) continue;

    next[field] = {
      ...resource[field],
      ...patch[field],
    };
  }

  return next;
}
