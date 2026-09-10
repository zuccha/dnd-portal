import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourcesTableExtra } from "./resources-table";

//------------------------------------------------------------------------------
// Create Resources Table Columns
//------------------------------------------------------------------------------

export function createResourcesTableColumns<
  R extends Resource,
  L extends LocalizedResource<R>,
>(
  others: ResourcesTableExtra<R, L>["columns"],
): ResourcesTableExtra<R, L>["columns"] {
  return [
    {
      key: "name",
      label: { en: "Name", it: "Nome" },
    },
    ...others,
    {
      key: "page",
      label: { en: "Page", it: "Pag." },
    },
  ];
}
