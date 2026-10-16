import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedSpecies } from "~/models/resources/species/localized-species";
import Field from "~/ui/field";
import Input from "~/ui/input";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Species Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function SpeciesPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedSpecies>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <Field label={t("speed")}>
      <Input
        onValueChange={(value) =>
          onLocalizedResourceUpdate("speed", { ...localizedResource.speed, value })
        }
        placeholder={t("speed.placeholder")}
        value={localizedResource.speed.value}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "speed": {
    en: "Speed",
    it: "Velocità",
  },
  "speed.placeholder": {
    en: "E.g. 30 ft",
    it: "Es. 9 m",
  },
};
