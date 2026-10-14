import { LayersIcon } from "lucide-react";
import { type Armor } from "~/models/resources/equipment/armors/armor";
import { armorForm, armorFormDataToResource } from "~/models/resources/equipment/armors/armor-form";
import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import { type LocalizedArmor } from "~/models/resources/equipment/armors/localized-armor";
import { hasAvailableEquipmentModifier } from "~/models/resources/equipment/equipment-variant";
import { armorModifierStore } from "~/models/resources/modifiers/equipment/armors/armor-modifier-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../../resource-module";
import { createEquipmentTableColumns } from "../equipment-table-columns";
import { createEquipmentVariantDialog } from "../equipment-variant-dialog";
import { createArmorEditor } from "./armor-editor";
import ArmorDetail from "./detail/armor-detail";
import { ArmorCard } from "./panel/armor-card";
import ArmorsFilters from "./panel/armors-filters";
import type { ResourcesTableExtra } from "../../resources-table";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createEquipmentTableColumns<Armor, LocalizedArmor>([
  {
    key: "type",
    label: { en: "Type", it: "Tipo" },
  },
  {
    key: "armor_class",
    label: { en: "Armor Class", it: "Classe Armatura" },
  },
  {
    key: "requirements",
    label: { en: "Requirements", it: "Requisiti" },
  },
  {
    key: "stealth",
    label: { en: "Stealth", it: "Furtività" },
  },
]);

//------------------------------------------------------------------------------
// Armor Variant Dialog
//------------------------------------------------------------------------------

const armorVariantDialog = createEquipmentVariantDialog(armorStore, armorModifierStore);

//------------------------------------------------------------------------------
// Actions
//------------------------------------------------------------------------------

const actions: ResourcesTableExtra<Armor, LocalizedArmor>["actions"] = [
  {
    icon: LayersIcon,
    isDisabled: (resource) => !hasAvailableEquipmentModifier(resource),
    isVisible: ({ virtual }) => !virtual,
    label: { en: "Add variant", it: "Aggiungi variante" },
    onClick: armorVariantDialog.open,
  },
];

//------------------------------------------------------------------------------
// Armors Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  armorStore,
  { initialPaletteName: "gray", initialView: "cards", path: Route.ResourcesEquipmentArmors },
  {
    Extra: armorVariantDialog.Dialog,
    album: { AlbumCard: ArmorCard, actions },
    detail: { Detail: ArmorDetail, actions },
    filters: { Filters: ArmorsFilters },
    form: {
      Editor: createArmorEditor(armorForm),
      form: armorForm,
      parseFormData: armorFormDataToResource,
    },
    table: {
      actions,
      columns,
      detailsKey: "details",
    },
  },
);
