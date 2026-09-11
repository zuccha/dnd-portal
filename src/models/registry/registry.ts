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
// Registry Sources
//------------------------------------------------------------------------------

export async function fetchRegistrySources(): Promise<Source[]> {
  const response = await fetch(`${registryUrl}/registry/sources`);
  if (!response.ok)
    throw new Error(`Registry request failed: ${response.status}`);

  return sourceSchema.array().parse(await response.json());
}

//------------------------------------------------------------------------------
// Registry Source Bundle
//------------------------------------------------------------------------------

export async function fetchRegistrySourceBundle(
  sourceId: string,
): Promise<SourceBundle> {
  const response = await fetch(`${registryUrl}/registry/sources/${sourceId}`);
  if (!response.ok)
    throw new Error(`Registry request failed: ${response.status}`);

  return sourceBundleSchema.parse(await response.json());
}
