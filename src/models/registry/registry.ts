import { type Source, sourceSchema } from "~/models/catalogue/source";
import {
  type SourceBundle,
  sourceBundleSchema,
} from "~/models/catalogue/source-bundle";

//------------------------------------------------------------------------------
// Registry Configuration
//------------------------------------------------------------------------------

const registryUrl = import.meta.env["VITE_REGISTRY_URL"];

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
// Registry Source Bundle
//------------------------------------------------------------------------------

export async function fetchRegistrySourceBundle(
  sourceId: string,
): Promise<SourceBundle> {
  return sourceBundleSchema.parse(
    await registryRequest(`/registry/sources/${sourceId}`),
  );
}
