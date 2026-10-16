import { VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedFeat } from "~/models/resources/feats/localized-feat";
import Field from "~/ui/field";
import Input from "~/ui/input";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Feat Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function FeatPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedFeat>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <VStack align="stretch" gap={3}>
      <Field label={t("min_level")}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("minLevel", { ...localizedResource.minLevel, value })
          }
          placeholder={t("min_level.placeholder")}
          value={localizedResource.minLevel.value}
        />
      </Field>
      <Field label={t("prerequisite")}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("prerequisite", {
              ...localizedResource.prerequisite,
              value,
            })
          }
          placeholder={t("prerequisite.placeholder")}
          value={localizedResource.prerequisite.value}
        />
      </Field>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "min_level": {
    en: "Minimum Level",
    it: "Livello Minimo",
  },
  "min_level.placeholder": {
    en: "E.g. 4",
    it: "Es. 4",
  },
  "prerequisite": {
    en: "Prerequisite",
    it: "Prerequisito",
  },
  "prerequisite.placeholder": {
    en: "E.g. Strength 13 or higher",
    it: "Es. Forza 13 o superiore",
  },
};
