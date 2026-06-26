import { WandIcon } from "lucide-react";
import type {
  DBEquipmentModifier,
  DBEquipmentModifierTranslation,
} from "~/models/resources/modifiers/equipment/db-equipment-modifier";
import type { EquipmentModifier } from "~/models/resources/modifiers/equipment/equipment-modifier";
import type { EquipmentModifierFilters } from "~/models/resources/modifiers/equipment/equipment-modifier-filters";
import {
  type EquipmentModifierFormData,
  equipmentModifierForm,
  equipmentModifierFormDataToDB,
} from "~/models/resources/modifiers/equipment/equipment-modifier-form";
import type {
  LocalizedEquipmentModifier,
  LocalizedEquipmentModifierFor,
} from "~/models/resources/modifiers/equipment/localized-equipment-modifier";
import type { ResourceOption } from "~/models/resources/resource";
import type { ResourceStore } from "~/models/resources/resource-store";
import type { Form } from "~/utils/form";
import type { PaletteName } from "~/utils/palette";
import type { ResourcesAlbumExtra } from "../../resources-album";
import type { ResourcesFiltersExtra } from "../../resources-filters";
import { createResourcesPanel } from "../../resources-panel";
import type { ResourcesTableExtra } from "../../resources-table";
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
// Create Equipment Modifiers Panel
//------------------------------------------------------------------------------

type SupportedEquipmentOptionsStore = {
  useResourceOptions: (sourceId: string) => ResourceOption[];
};

export function createEquipmentModifiersPanel<
  R extends EquipmentModifier,
  L extends LocalizedEquipmentModifierFor<R>,
  F extends EquipmentModifierFilters,
  DBR extends DBEquipmentModifier,
  DBT extends DBEquipmentModifierTranslation,
  FF extends EquipmentModifierFormData,
>(
  modifierStore: ResourceStore<R, L, F, DBR, DBT>,
  supportedEquipmentStore: SupportedEquipmentOptionsStore,
  initialPaletteName: PaletteName,
  formOptions: {
    form: Form<FF>;
    parseFormData: (data: Partial<FF>) => {
      resource: Partial<DBR>;
      translation: Partial<DBT>;
    };
  } = {
    form: equipmentModifierForm as unknown as Form<FF>,
    parseFormData: equipmentModifierFormDataToDB as unknown as (
      data: Partial<FF>,
    ) => {
      resource: Partial<DBR>;
      translation: Partial<DBT>;
    },
  },
  uiOptions: {
    AlbumCard?: ResourcesAlbumExtra<R, L>["AlbumCard"];
    Filters?: ResourcesFiltersExtra["Filters"];
    createEditor?: (
      form: Form<FF>,
      supportedEquipmentStore: SupportedEquipmentOptionsStore,
    ) => React.FC<{ resource: R; sourceId: string }>;
  } = {},
) {
  const AlbumCard =
    uiOptions.AlbumCard ??
    (EquipmentModifierCard as ResourcesAlbumExtra<R, L>["AlbumCard"]);
  const Filters = uiOptions.Filters ?? EquipmentModifiersFilters;
  const createEditor = uiOptions.createEditor ?? createEquipmentModifierEditor;

  return createResourcesPanel(
    modifierStore,
    { initialPaletteName },
    {
      album: { AlbumCard },
      filters: { Filters },
      form: {
        Editor: createEditor(formOptions.form, supportedEquipmentStore),
        form: formOptions.form,
        parseFormData: formOptions.parseFormData,
      },
      table: {
        columns: columns as ResourcesTableExtra<R, L>["columns"],
        detailsKey: "details",
      },
    },
  );
}
