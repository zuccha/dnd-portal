import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedCreatureTag } from "~/models/resources/creature-tags/localized-creature-tag";
import Field from "~/ui/field";
import Input from "~/ui/input";
import ResourcePrintDeckEntryEditor from "./resource-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Creature Tag Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function CreatureTagPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedCreatureTag>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <ResourcePrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <Field label={t("creatures")}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("creatures", { ...localizedResource.creatures, value })
          }
          placeholder={t("creatures.placeholder")}
          value={localizedResource.creatures.value}
        />
      </Field>
    </ResourcePrintDeckEntryEditor>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "creatures": {
    en: "Creatures",
    it: "Creature",
  },
  "creatures.placeholder": {
    en: "E.g. Owlbear, Winter Wolf",
    it: "Es. Orsogufo, Lupo Invernale",
  },
};
