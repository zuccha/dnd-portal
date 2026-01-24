import { WandIcon } from "lucide-react";
import { type Armor } from "~/models/resources/equipment/armors/armor";
import {
  armorForm,
  armorFormDataToDB,
} from "~/models/resources/equipment/armors/armor-form";
import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import { type LocalizedArmor } from "~/models/resources/equipment/armors/localized-armor";
import { createResourcesPanel } from "../../resources-panel";
import type { ResourcesTableExtra } from "../../resources-table";
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
    maxW: "5em",
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
    w: "4em",
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
// Armors Panel
//------------------------------------------------------------------------------

const ArmorsPanel = createResourcesPanel(
  armorStore,
  { initialPaletteName: "gray" },
  {
    album: { AlbumCard: ArmorCard },
    filters: { Filters: ArmorsFilters },
    form: {
      Editor: createArmorEditor(armorForm),
      form: armorForm,
      parseFormData: armorFormDataToDB,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default ArmorsPanel;
