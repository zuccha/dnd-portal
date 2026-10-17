import type { Resource } from "./resource";

//------------------------------------------------------------------------------
// Serialize Resource Link
//------------------------------------------------------------------------------

export function serializeResourceLink(resource: Pick<Resource, "id" | "kind">, fallback = "") {
  const fallbackValue = fallback ? `:${fallback.replaceAll("]]", "]\\]")}` : "";
  return `[[${resource.kind}:${resource.id}${fallbackValue}]]`;
}
