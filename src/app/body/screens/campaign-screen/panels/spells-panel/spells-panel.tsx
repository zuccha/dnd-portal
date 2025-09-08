import {
  type DBSpell,
  type DBSpellTranslation,
  dbSpellSchema,
  dbSpellTranslationSchema,
} from "../../../../../../resources/db-spell";
import {
  type LocalizedSpell,
  useLocalizeSpell,
} from "../../../../../../resources/localized-spell";
import {
  type Spell,
  defaultSpell,
  spellsStore,
  updateSpell,
} from "../../../../../../resources/spell";
import { report } from "../../../../../../utils/error";
import type { ResourcesListTableColumn } from "../resources/resources-list-table";
import { createResourcesPanel } from "../resources/resources-panel";
import SpellCard from "./spell-card";
import SpellEditor from "./spell-editor";
import spellEditorForm, {
  type SpellEditorFormFields,
} from "./spell-editor-form";
import SpellsFilters from "./spells-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: Omit<
  ResourcesListTableColumn<Spell, LocalizedSpell>,
  "label"
>[] = [
  { key: "name" },
  { key: "level", maxW: "5em", textAlign: "center" },
  { key: "character_classes", maxW: "8em" },
  { key: "school", maxW: "8em" },
  { key: "casting_time", maxW: "9em" },
  { key: "ritual", textAlign: "center", w: "4em" },
  { key: "range", maxW: "8em" },
  { key: "duration", maxW: "9em" },
  { key: "concentration", textAlign: "center", w: "4em" },
  { key: "components" },
] as const;

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  name: {
    en: "Name",
    it: "Nome",
  },

  level: {
    en: "Lvl",
    it: "Lvl",
  },

  character_classes: {
    en: "Classes",
    it: "Classi",
  },

  school: {
    en: "School",
    it: "Scuola",
  },

  casting_time: {
    en: "Cast",
    it: "Lancio",
  },

  range: {
    en: "Range",
    it: "Gittata",
  },

  duration: {
    en: "Duration",
    it: "Durata",
  },

  ritual: {
    en: "R",
    it: "R",
  },

  concentration: {
    en: "C",
    it: "C",
  },

  components: {
    en: "V, S, M",
    it: "V, S, M",
  },
};

//------------------------------------------------------------------------------
// Parse Form Data
//------------------------------------------------------------------------------

function parseFormData(
  data: Partial<SpellEditorFormFields>
):
  | { spell: Partial<DBSpell>; translation: Partial<DBSpellTranslation> }
  | string {
  const maybeSpell = {
    casting_time: data.casting_time,
    casting_time_value: data.casting_time_value,
    character_classes: data.character_classes,
    concentration: data.concentration,
    duration: data.duration,
    duration_value: data.duration_value,
    level: data.level,
    material: data.material,
    range: data.range,
    range_value_imp: data.range_value_imp,
    range_value_met: data.range_value_met,
    ritual: data.ritual,
    school: data.school,
    somatic: data.somatic,
    verbal: data.verbal,
  };

  const maybeTranslation = {
    description: data.description,
    materials: data.materials,
    name: data.name,
    upgrade: data.upgrade,
  };

  const spell = dbSpellSchema.partial().safeParse(maybeSpell);
  if (!spell.success) return report(spell.error, "form.error.invalid");

  const translation = dbSpellTranslationSchema
    .partial()
    .safeParse(maybeTranslation);
  if (!translation.success)
    return report(translation.error, "form.error.invalid_translation");

  return { spell: spell.data, translation: translation.data };
}

//------------------------------------------------------------------------------
// Submit Editor Form
//------------------------------------------------------------------------------

async function submitEditorForm(
  data: Partial<SpellEditorFormFields>,
  { id, lang }: { id: string; lang: string }
) {
  const errorOrData = parseFormData(data);
  if (typeof errorOrData === "string") return errorOrData;

  const { spell, translation } = errorOrData;
  const response = await updateSpell(id, lang, spell, translation);
  if (response.error)
    return report(response.error, "form.error.update_failure");

  return undefined;
}

//------------------------------------------------------------------------------
// Submit Creator Form
//------------------------------------------------------------------------------

async function submitCreatorForm(
  data: Partial<SpellEditorFormFields>,
  { campaignId, lang }: { campaignId: string; lang: string }
) {
  const errorOrData = parseFormData(data);
  if (typeof errorOrData === "string") return errorOrData;

  const { spell, translation } = errorOrData;
  // const response = await createSpell(campaignId, lang, spell, translation);
  // if (response.error) return report(response.error, "form.error.creation_failure");
  console.log(campaignId, lang, spell, translation);

  return undefined;
}

//------------------------------------------------------------------------------
// Spells Panel
//------------------------------------------------------------------------------

const SpellsPanel = createResourcesPanel({
  Filters: SpellsFilters,
  ResourceCard: SpellCard,
  ResourceEditorContent: SpellEditor,
  defaultResource: defaultSpell,
  form: spellEditorForm,
  listTableColumns: columns,
  listTableColumnsI18nContext: i18nContext,
  listTableDescriptionKey: "description",
  onSubmitCreatorForm: submitCreatorForm,
  onSubmitEditorForm: submitEditorForm,
  store: spellsStore,
  useLocalizeResource: useLocalizeSpell,
});

export default SpellsPanel;
