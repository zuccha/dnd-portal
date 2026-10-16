import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedCreatureTreasure } from "~/models/resources/creature-treasures/localized-creature-treasure";
import Field from "~/ui/field";
import Input from "~/ui/input";
import ResourcePrintDeckEntryEditor from "./resource-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Creature Treasure Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function CreatureTreasurePrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedCreatureTreasure>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <ResourcePrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <Field label={t("families")}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("families", { ...localizedResource.families, value })
          }
          placeholder={t("families.placeholder")}
          value={localizedResource.families.value}
        />
      </Field>
    </ResourcePrintDeckEntryEditor>
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
