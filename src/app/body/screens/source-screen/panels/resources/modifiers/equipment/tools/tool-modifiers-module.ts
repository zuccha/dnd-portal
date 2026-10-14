import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import {
  toolModifierForm,
  toolModifierFormDataToResource,
} from "~/models/resources/modifiers/equipment/tools/tool-modifier-form";
import { toolModifierStore } from "~/models/resources/modifiers/equipment/tools/tool-modifier-store";
import { Route } from "~/navigation/routes";
import { createEquipmentModifierModule } from "../equipment-modifiers-module";
import ToolModifierDetail from "./detail/tool-modifier-detail";
import { ToolModifierCard } from "./panel/tool-modifier-card";
import ToolModifiersFilters from "./panel/tool-modifiers-filters";
import { createToolModifierEditor } from "./tool-modifier-editor";

//------------------------------------------------------------------------------
// Tool Modifiers Panel
//------------------------------------------------------------------------------

export const resourceModule = createEquipmentModifierModule(
  toolModifierStore,
  toolStore,
  "coral",
  Route.ResourcesEquipmentToolModifiers,
  ToolModifierDetail,
  {
    form: toolModifierForm,
    parseFormData: toolModifierFormDataToResource,
  },
  {
    AlbumCard: ToolModifierCard,
    Filters: ToolModifiersFilters,
    createEditor: createToolModifierEditor,
  },
);
