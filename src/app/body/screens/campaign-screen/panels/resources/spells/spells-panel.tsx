import {
  type DBSpell,
  type DBSpellTranslation,
  dbSpellSchema,
  dbSpellTranslationSchema,
} from "~/models/resources/spells/db-spell";
import { type LocalizedSpell } from "~/models/resources/spells/localized-spell";
import { type Spell } from "~/models/resources/spells/spell";
import { spellStore } from "~/models/resources/spells/spell-store";
import { report } from "~/utils/error";
import { createResourcesPanel } from "../_base/resources-panel";
import type { ResourcesTableExtra } from "../_base/resources-table";
import SpellEditor from "./spell-editor";
import spellEditorForm, {
  type SpellEditorFormFields,
} from "./spell-editor-form";
import SpellsAlbumCardContent from "./spells-album-card-content";
import SpellsFilters from "./spells-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Spell, LocalizedSpell>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "level",
    label: { en: "Lvl", it: "Lvl" },
    maxW: "5em",
    textAlign: "center",
  },
  {
    key: "character_classes",
    label: { en: "Classes", it: "Classi" },
    maxW: "8em",
  },
  {
    key: "school",
    label: { en: "School", it: "Scuola" },
    maxW: "8em",
  },
  {
    key: "casting_time",
    label: { en: "Cast", it: "Lancio" },
    maxW: "9em",
  },
  {
    key: "ritual",
    label: { en: "R", it: "R" },
    textAlign: "center",
    w: "4em",
  },
  {
    key: "range",
    label: { en: "Range", it: "Gittata" },
    maxW: "8em",
  },
  {
    key: "duration",
    label: { en: "Duration", it: "Durata" },
    maxW: "9em",
  },
  {
    key: "concentration",
    label: { en: "C", it: "C" },
    textAlign: "center",
    w: "4em",
  },
  {
    key: "components",
    label: { en: "V, S, M", it: "V, S, M" },
  },
] as const;

//------------------------------------------------------------------------------
// Parse Form Data
//------------------------------------------------------------------------------

function parseFormData(
  data: Partial<SpellEditorFormFields>,
):
  | { resource: Partial<DBSpell>; translation: Partial<DBSpellTranslation> }
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
    range_value: data.range_value,
    ritual: data.ritual,
    school: data.school,
    somatic: data.somatic,
    verbal: data.verbal,
    visibility: data.visibility,
  };

  const maybeTranslation = {
    description: data.description,
    materials: data.materials,
    name: data.name,
    page: data.page || null,
    upgrade: data.upgrade,
  };

  const spell = dbSpellSchema.partial().safeParse(maybeSpell);
  if (!spell.success) return report(spell.error, "form.error.invalid");

  const translation = dbSpellTranslationSchema
    .partial()
    .safeParse(maybeTranslation);
  if (!translation.success)
    return report(translation.error, "form.error.invalid_translation");

  return { resource: spell.data, translation: translation.data };
}

//------------------------------------------------------------------------------
// Spells Panel
//------------------------------------------------------------------------------

const SpellsPanel = createResourcesPanel(spellStore, {
  album: { pages: [SpellsAlbumCardContent] },
  filters: { Filters: SpellsFilters },
  form: { Editor: SpellEditor, form: spellEditorForm, parseFormData },
  table: { columns, detailsKey: "description" },
});

export default SpellsPanel;
