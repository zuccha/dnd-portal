import {
  type Creature,
  defaultCreature,
} from "../../../../../../resources/creatures/creature";
import { creaturesStore } from "../../../../../../resources/creatures/creatures-store";
import {
  type DBCreature,
  type DBCreatureTranslation,
  dbCreatureSchema,
  dbCreatureTranslationSchema,
} from "../../../../../../resources/creatures/db-creature";
import { type LocalizedCreature } from "../../../../../../resources/creatures/localized-creature";
import { report } from "../../../../../../utils/error";
import type { ResourcesListTableColumn } from "../resources/resources-list-table";
import { createResourcesPanel } from "../resources/resources-panel";
import CreatureCard from "./creature-card";
import CreatureEditor from "./creature-editor";
import creatureEditorForm, {
  type CreatureEditorFormFields,
} from "./creature-editor-form";
import CreaturesFilters from "./creatures-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesListTableColumn<Creature, LocalizedCreature>[] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "type",
    label: { en: "Type", it: "Tipo" },
    maxW: "10em",
  },
  {
    key: "cr",
    label: { en: "CR", it: "GS" },
    maxW: "5em",
    textAlign: "center",
  },
] as const;

//------------------------------------------------------------------------------
// Parse Form Data
//------------------------------------------------------------------------------

function parseFormData(data: Partial<CreatureEditorFormFields>):
  | {
      resource: Partial<DBCreature>;
      translation: Partial<DBCreatureTranslation>;
    }
  | string {
  const maybeCreature = {
    visibility: data.visibility,
  };

  const maybeTranslation = {
    name: data.name,
  };

  const creature = dbCreatureSchema.partial().safeParse(maybeCreature);
  if (!creature.success) return report(creature.error, "form.error.invalid");

  const translation = dbCreatureTranslationSchema
    .partial()
    .safeParse(maybeTranslation);
  if (!translation.success)
    return report(translation.error, "form.error.invalid_translation");

  return { resource: creature.data, translation: translation.data };
}

//------------------------------------------------------------------------------
// Creatures Panel
//------------------------------------------------------------------------------

const CreaturesPanel = createResourcesPanel({
  Card: CreatureCard,
  EditorContent: CreatureEditor,
  Filters: CreaturesFilters,
  defaultResource: defaultCreature,
  form: creatureEditorForm,
  listTableColumns: columns,
  listTableDescriptionKey: "description",
  name: { en: "creatures", it: "creature" },
  parseFormData,
  store: creaturesStore,
});

export default CreaturesPanel;
