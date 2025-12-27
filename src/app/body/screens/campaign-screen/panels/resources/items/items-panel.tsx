import { WandIcon } from "lucide-react";
import {
  type DBItem,
  type DBItemTranslation,
  dbItemSchema,
  dbItemTranslationSchema,
} from "~/models/resources/equipment/items/db-item";
import { type Item } from "~/models/resources/equipment/items/item";
import { itemStore } from "~/models/resources/equipment/items/item-store";
import { type LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import { report } from "~/utils/error";
import { createResourcesPanel } from "../_base/resources-panel";
import type { ResourcesTableExtra } from "../_base/resources-table";
import ItemEditor from "./item-editor";
import itemEditorForm, { type ItemEditorFormFields } from "./item-editor-form";
import ItemsAlbumCardContent from "./items-album-card-content";
import ItemsFilters from "./items-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Item, LocalizedItem>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
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
// Parse Form Data
//------------------------------------------------------------------------------

function parseFormData(
  data: Partial<ItemEditorFormFields>,
):
  | { resource: Partial<DBItem>; translation: Partial<DBItemTranslation> }
  | string {
  const maybeItem = {
    cost: data.cost,
    magic: data.magic,
    visibility: data.visibility,
    weight: data.weight,
  };

  const maybeTranslation = {
    name: data.name,
    notes: data.notes,
    page: data.page || null,
  };

  const item = dbItemSchema.partial().safeParse(maybeItem);
  if (!item.success) return report(item.error, "form.error.invalid");

  const translation = dbItemTranslationSchema
    .partial()
    .safeParse(maybeTranslation);
  if (!translation.success)
    return report(translation.error, "form.error.invalid_translation");

  return { resource: item.data, translation: translation.data };
}

//------------------------------------------------------------------------------
// Items Panel
//------------------------------------------------------------------------------

const ItemsPanel = createResourcesPanel(itemStore, {
  album: { pages: [ItemsAlbumCardContent] },
  filters: { Filters: ItemsFilters },
  form: { Editor: ItemEditor, form: itemEditorForm, parseFormData },
  table: { columns, detailsKey: "notes" },
});

export default ItemsPanel;
