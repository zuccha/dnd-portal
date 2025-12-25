import { WandIcon } from "lucide-react";
import {
  type DBItem,
  type DBItemTranslation,
  dbItemSchema,
  dbItemTranslationSchema,
} from "~/models/resources/equipment/items/db-item";
import {
  type Item,
  defaultItem,
} from "~/models/resources/equipment/items/item";
import { itemsStore } from "~/models/resources/equipment/items/items-store";
import { type LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import { report } from "~/utils/error";
import type { ResourcesListTableColumn } from "../_base/resources-list-table";
import { createResourcesPanel } from "../_base/resources-panel";
import ItemCard from "./item-card";
import ItemEditor from "./item-editor";
import itemEditorForm, { type ItemEditorFormFields } from "./item-editor-form";
import ItemsFilters from "./items-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesListTableColumn<Item, LocalizedItem>[] = [
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

const ItemsPanel = createResourcesPanel({
  Card: ItemCard,
  EditorContent: ItemEditor,
  Filters: ItemsFilters,
  defaultResource: defaultItem,
  form: itemEditorForm,
  listTableColumns: columns,
  listTableDescriptionKey: "notes",
  name: { en: "items", it: "armi" },
  parseFormData,
  store: itemsStore,
});

export default ItemsPanel;
