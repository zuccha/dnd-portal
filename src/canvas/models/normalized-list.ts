import z, { ZodType } from "zod/v4";

//------------------------------------------------------------------------------
// Normalized List
//------------------------------------------------------------------------------

export const normalizedListSchema = <T extends ZodType>(schema: T) =>
  z.object({
    byId: z.record(z.string(), schema).default({}),
    ids: z.array(z.string()).default([]),
  });

export type NormalizedList<T> = {
  ids: string[];
  byId: Record<string, T>;
};

export function normalize<T>(
  items: T[],
  getId: (item: T) => string
): NormalizedList<T> {
  const ids: string[] = new Array(items.length);
  const byId: Record<string, T> = {};
  for (let i = 0; i < items.length; ++i) {
    const item = items[i];
    const id = getId(item);
    ids[i] = id;
    byId[id] = item;
  }
  return { byId, ids };
}
