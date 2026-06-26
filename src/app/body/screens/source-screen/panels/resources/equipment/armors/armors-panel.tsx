import { LayersIcon, WandIcon } from "lucide-react";
import { type Armor } from "~/models/resources/equipment/armors/armor";
import {
  armorForm,
  armorFormDataToDB,
} from "~/models/resources/equipment/armors/armor-form";
import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import { type LocalizedArmor } from "~/models/resources/equipment/armors/localized-armor";
import { hasAvailableEquipmentModifier } from "~/models/resources/equipment/equipment-variant";
import { armorModifierStore } from "~/models/resources/modifiers/equipment/armors/armor-modifier-store";
import { createResourcesPanel } from "../../resources-panel";
import type { ResourcesTableExtra } from "../../resources-table";
import { createEquipmentVariantDialog } from "../equipment-variant-dialog";
import { ArmorCard } from "./armor-card";
import { createArmorEditor } from "./armor-editor";
import ArmorsFilters from "./armors-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Armor, LocalizedArmor>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
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
] as const;

//------------------------------------------------------------------------------
// Armor Variant Dialog
//------------------------------------------------------------------------------

const armorVariantDialog = createEquipmentVariantDialog(
  armorStore,
  armorModifierStore,
);

//------------------------------------------------------------------------------
// Actions
//------------------------------------------------------------------------------

const actions: ResourcesTableExtra<Armor, LocalizedArmor>["actions"] = [
  {
    icon: LayersIcon,
    isVisible: hasAvailableEquipmentModifier,
    label: { en: "Add variant", it: "Aggiungi variante" },
    onClick: armorVariantDialog.open,
  },
];

//------------------------------------------------------------------------------
// Armors Panel
//------------------------------------------------------------------------------

const ArmorsPanel = createResourcesPanel(
  armorStore,
  { initialPaletteName: "gray" },
  {
    Extra: armorVariantDialog.Dialog,
    album: { AlbumCard: ArmorCard, actions },
    filters: { Filters: ArmorsFilters },
    form: {
      Editor: createArmorEditor(armorForm),
      form: armorForm,
      parseFormData: armorFormDataToDB,
    },
    table: {
      actions,
      columns,
      detailsKey: "details",
    },
  },
);

export default ArmorsPanel;
