import { WandIcon } from "lucide-react";
import type { EquipmentModifier } from "~/models/resources/equipment/modifiers/equipment-modifier";
import {
  equipmentModifierForm,
  equipmentModifierFormDataToDB,
} from "~/models/resources/equipment/modifiers/equipment-modifier-form";
import { equipmentModifierStore } from "~/models/resources/equipment/modifiers/equipment-modifier-store";
import type { LocalizedEquipmentModifier } from "~/models/resources/equipment/modifiers/localized-equipment-modifier";
import { createResourcesPanel } from "../resources-panel";
import type { ResourcesTableExtra } from "../resources-table";
import { EquipmentModifierCard } from "./equipment-modifier-card";
import { createEquipmentModifierEditor } from "./equipment-modifier-editor";
import EquipmentModifiersFilters from "./equipment-modifiers-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<
  EquipmentModifier,
  LocalizedEquipmentModifier
>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "applies_to",
    label: { en: "Applies To", it: "Applicabile A" },
  },
  {
    key: "cost_delta",
    label: { en: "Cost", it: "Costo" },
    textAlign: "right",
    w: "1%",
  },
  {
    key: "weight_delta",
    label: { en: "Weight", it: "Peso" },
    textAlign: "right",
    w: "1%",
  },
  {
    icon: WandIcon,
    key: "make_magic",
    label: { en: "🪄", it: "🪄" },
    textAlign: "center",
  },
  {
    key: "rarity_minimum",
    label: { en: "Rarity", it: "Rarità" },
  },
] as const;

//------------------------------------------------------------------------------
// Equipment Modifiers Panel
//------------------------------------------------------------------------------

const EquipmentModifiersPanel = createResourcesPanel(
  equipmentModifierStore,
  { initialPaletteName: "purple" },
  {
    album: { AlbumCard: EquipmentModifierCard },
    filters: { Filters: EquipmentModifiersFilters },
    form: {
      Editor: createEquipmentModifierEditor(equipmentModifierForm),
      form: equipmentModifierForm,
      parseFormData: equipmentModifierFormDataToDB,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default EquipmentModifiersPanel;
