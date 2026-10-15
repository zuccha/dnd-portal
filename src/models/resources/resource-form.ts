import z from "zod";
import { resourceVisibilitySchema } from "../types/resource-visibility";
import type { RelationEndpointUpdate, RelationGroup } from "../catalogue/resource-relations";
import type { Resource } from "./resource";

//------------------------------------------------------------------------------
// Resource Form Output
//------------------------------------------------------------------------------

export type ResourceFormOutput<R extends Resource> = {
  relations: RelationEndpointUpdate[];
  resource: Partial<R>;
};

//------------------------------------------------------------------------------
// Parsed Resource Form Output
//------------------------------------------------------------------------------

export type ParsedResourceFormOutput<R extends Resource> = Partial<R> | ResourceFormOutput<R>;

//------------------------------------------------------------------------------
// Create Relation Endpoint Updates
//------------------------------------------------------------------------------

export function createRelationEndpointUpdates(
  group: RelationGroup,
  related: RelationEndpointUpdate["related"] | undefined,
): RelationEndpointUpdate[] {
  return related === undefined ? [] : [{ group, related }];
}

//------------------------------------------------------------------------------
// Create Id Relation Endpoint Updates
//------------------------------------------------------------------------------

export function createIdRelationEndpointUpdates(
  group: RelationGroup,
  relatedIds: readonly string[] | undefined,
): RelationEndpointUpdate[] {
  return createRelationEndpointUpdates(
    group,
    relatedIds?.map((id) => ({ id })),
  );
}

//------------------------------------------------------------------------------
// Split Resource Form Output
//------------------------------------------------------------------------------

export function splitResourceFormOutput<R extends Resource>(
  output: ParsedResourceFormOutput<R>,
): ResourceFormOutput<R> {
  return "resource" in output
    ? { resource: output.resource, relations: output.relations }
    : { resource: output, relations: [] };
}

//------------------------------------------------------------------------------
// Resource Form Data
//------------------------------------------------------------------------------

export const resourceFormDataSchema = z.object({
  image_url: z.string().default(""),
  name: z.string().default(""),
  page: z.number().default(0),
  visibility: resourceVisibilitySchema.default("public"),
});

export type ResourceFormData = z.infer<typeof resourceFormDataSchema>;

//------------------------------------------------------------------------------
// Resource Form Data Patch
//------------------------------------------------------------------------------

export type ResourceFormDataPatch = Partial<
  Pick<Resource, "image_url" | "name" | "page" | "visibility">
>;

//------------------------------------------------------------------------------
// Create Resource Form Data Patch
//------------------------------------------------------------------------------

export function createResourceFormDataPatch<P extends object>(patch: P): Partial<P> {
  return Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<P>;
}

//------------------------------------------------------------------------------
// Create Resource Form Data I18n Value
//------------------------------------------------------------------------------

export function createResourceFormDataI18nValue<T extends number | string>(
  value: T | null | undefined,
  lang: string,
): Record<string, T | null> | undefined {
  return value === undefined ? undefined : { [lang]: value };
}

//------------------------------------------------------------------------------
// Resource Form Data To Resource
//------------------------------------------------------------------------------

export function resourceFormDataToResource(
  data: Partial<ResourceFormData>,
  lang: string,
): ResourceFormDataPatch {
  return createResourceFormDataPatch({
    image_url: data.image_url === undefined ? undefined : data.image_url || null,
    name: createResourceFormDataI18nValue(data.name, lang),
    page:
      data.page === undefined
        ? undefined
        : createResourceFormDataI18nValue(data.page || null, lang),
    visibility: data.visibility,
  });
}
