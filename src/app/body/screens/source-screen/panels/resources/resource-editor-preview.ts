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

//------------------------------------------------------------------------------
// Apply Resource Editor Paste
//------------------------------------------------------------------------------

export function applyResourceEditorPaste<R extends Resource>(
  resource: R,
  pastedResource: Resource,
  editableFields: string[],
): R {
  const patch = Object.fromEntries(
    editableFields
      .filter((field) => field in pastedResource)
      .map((field) => [field, (pastedResource as Record<string, unknown>)[field]]),
  ) as Partial<R>;

  return { ...resource, ...patch };
}
