import type { Resource } from "~/models/resources/resource";
import type { TranslationFields } from "~/models/resources/resource";
import { mergeResourcePatch } from "~/models/resources/resource-patch";

//------------------------------------------------------------------------------
// Resource Editor Preview Patch
//------------------------------------------------------------------------------

export type ResourceEditorPreviewPatch<R extends Resource> = Partial<R>;

//------------------------------------------------------------------------------
// Apply Resource Editor Preview Patch
//------------------------------------------------------------------------------

export function applyResourceEditorPreviewPatch<R extends Resource>(
  resource: R,
  patch: ResourceEditorPreviewPatch<R>,
  translationFields: TranslationFields<R>[],
): R {
  return mergeResourcePatch(resource, patch, translationFields);
}
