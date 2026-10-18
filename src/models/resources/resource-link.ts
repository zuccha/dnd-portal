import type { Resource } from "./resource";

//------------------------------------------------------------------------------
// Serialize Resource Link
//------------------------------------------------------------------------------

export function serializeResourceLink(
  resource: Pick<Resource, "id" | "kind">,
  fallback = "",
  text = "",
) {
  return fallback && text
    ? `[[${resource.kind}:${resource.id}:${fallback}:${text}]]`
    : fallback
      ? `[[${resource.kind}:${resource.id}:${fallback}]]`
      : `[[${resource.kind}:${resource.id}]]`;
}
