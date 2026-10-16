import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedCreatureHabitat } from "~/models/resources/creature-habitats/localized-creature-habitat";
import Field from "~/ui/field";
import Input from "~/ui/input";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Creature Habitat Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function CreatureHabitatPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedCreatureHabitat>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <Field label={t("families")}>
      <Input
        onValueChange={(value) =>
          onLocalizedResourceUpdate("families", { ...localizedResource.families, value })
        }
        placeholder={t("families.placeholder")}
        value={localizedResource.families.value}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "families": {
    en: "Families",
    it: "Famiglie",
  },
  "families.placeholder": {
    en: "E.g. Arctic, Forest",
    it: "Es. Artico, Foresta",
  },
};
