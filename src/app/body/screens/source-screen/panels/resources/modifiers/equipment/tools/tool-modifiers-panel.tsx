import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import {
  toolModifierForm,
  toolModifierFormDataToDB,
} from "~/models/resources/modifiers/equipment/tools/tool-modifier-form";
import { toolModifierStore } from "~/models/resources/modifiers/equipment/tools/tool-modifier-store";
import { createEquipmentModifiersPanel } from "../equipment-modifiers-panel";
import { ToolModifierCard } from "./tool-modifier-card";
import { createToolModifierEditor } from "./tool-modifier-editor";
import ToolModifiersFilters from "./tool-modifiers-filters";

//------------------------------------------------------------------------------
// Tool Modifiers Panel
//------------------------------------------------------------------------------

const ToolModifiersPanel = createEquipmentModifiersPanel(
  toolModifierStore,
  toolStore,
  "coral",
  {
    form: toolModifierForm,
    parseFormData: toolModifierFormDataToDB,
  },
  {
    AlbumCard: ToolModifierCard,
    Filters: ToolModifiersFilters,
    createEditor: createToolModifierEditor,
  },
);

export default ToolModifiersPanel;
