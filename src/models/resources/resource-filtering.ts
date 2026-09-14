import { translate } from "~/i18n/i18n-string";
import { normalizeString } from "~/utils/string";
import type { Resource } from "./resource";
import type { ResourceFilters } from "./resource-filters";

//------------------------------------------------------------------------------
// Types
//------------------------------------------------------------------------------

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Inclusion Filter
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export type InclusionFilter = Record<string, boolean | undefined> | undefined;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Resource Matcher
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export type ResourceMatcher<R extends Resource, F extends ResourceFilters> = (
  resource: R,
  filters: F,
) => boolean;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Resource Comparator
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export type ResourceComparator<R extends Resource, F extends ResourceFilters> = (
  a: R,
  b: R,
  filters: F,
  lang: string,
) => number;

//------------------------------------------------------------------------------
// Filter Matching
//------------------------------------------------------------------------------

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Matches Boolean
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function matchesBoolean(value: boolean, filter: boolean | undefined): boolean {
  return filter === undefined || value === filter;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Matches Inclusion
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function matchesInclusion(
  value: string | number | boolean | null | undefined,
  filter: InclusionFilter,
): boolean {
  const valueKey = `${value}`;
  const entries = Object.entries(filter ?? {});
  const included = entries.filter(([, selected]) => selected === true);
  const excluded = entries.filter(([, selected]) => selected === false);

  if (excluded.some(([key]) => key === valueKey)) return false;
  if (included.length === 0) return true;
  return included.some(([key]) => key === valueKey);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Matches Inclusion List
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function matchesInclusionList(
  values: readonly (string | number | boolean)[],
  filter: InclusionFilter,
): boolean {
  const valueKeys = new Set(values.map((value) => `${value}`));
  const entries = Object.entries(filter ?? {});
  const included = entries.filter(([, selected]) => selected === true);
  const excluded = entries.filter(([, selected]) => selected === false);

  if (excluded.some(([key]) => valueKeys.has(key))) return false;
  if (included.length === 0) return true;
  return included.some(([key]) => valueKeys.has(key));
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Matches Name
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function matchesName(resource: Resource, normalizedName: string): boolean {
  if (!normalizedName) return true;

  return Object.values(resource.name)
    .filter((name) => name)
    .some((name) => normalizeString(name!).includes(normalizedName));
}

//------------------------------------------------------------------------------
// Resource Sorting
//------------------------------------------------------------------------------

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Compare Direction
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function compareDirection(result: number, orderDir: ResourceFilters["order_dir"]): number {
  return orderDir === "desc" ? -result : result;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Compare Names
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function compareNames(
  a: Resource,
  b: Resource,
  lang: string,
  orderDir: ResourceFilters["order_dir"],
): number {
  const result = translate(a.name, lang).localeCompare(translate(b.name, lang));
  return compareDirection(result || a.id.localeCompare(b.id), orderDir);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Compare Numbers
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function compareNumbers(
  a: number,
  b: number,
  orderDir: ResourceFilters["order_dir"],
): number {
  return compareDirection(a - b, orderDir);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Compare Resources
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function compareResources<R extends Resource, F extends ResourceFilters>(
  a: R,
  b: R,
  filters: F,
  lang: string,
): number {
  return compareNames(a, b, lang, filters.order_dir);
}
