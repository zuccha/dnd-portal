import { WandIcon } from "lucide-react";
import type { Equipment } from "~/models/resources/equipment/equipment";
import type { LocalizedEquipment } from "~/models/resources/equipment/localized-equipment";
import type { ResourcesTableExtra } from "../resources-table";
import { createResourcesTableColumns } from "../resources-table-columns";

//------------------------------------------------------------------------------
// Create Resources Table Columns
//------------------------------------------------------------------------------

export function createEquipmentTableColumns<
  R extends Equipment,
  L extends LocalizedEquipment<R>,
>(
  others: ResourcesTableExtra<R, L>["columns"],
): ResourcesTableExtra<R, L>["columns"] {
  return createResourcesTableColumns<R, L>([
    ...others,
    {
      icon: WandIcon,
      key: "magic",
      label: { en: "🪄", it: "🪄" },
      textAlign: "center",
      w: "1%",
    },
    {
      key: "weight",
      label: { en: "Weight", it: "Peso" },
      textAlign: "right",
      w: "1%",
      whiteSpace: "nowrap",
    },
    {
      key: "cost",
      label: { en: "Cost", it: "Costo" },
      textAlign: "right",
      w: "1%",
      whiteSpace: "nowrap",
    },
  ]);
}
