import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedLanguage } from "~/models/resources/languages/localized-language";
import Field from "~/ui/field";
import Input from "~/ui/input";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Language Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function LanguagePrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedLanguage>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <Field label={t("origin")}>
      <Input
        onValueChange={(value) =>
          onLocalizedResourceUpdate({
            ...localizedResource,
            origin: { ...localizedResource.origin, value },
          })
        }
        placeholder={t("origin.placeholder")}
        value={localizedResource.origin.value}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "origin": {
    en: "Origin",
    it: "Origine",
  },
  "origin.placeholder": {
    en: "e.g. Elves",
    it: "Es. Elfi",
  },
};
