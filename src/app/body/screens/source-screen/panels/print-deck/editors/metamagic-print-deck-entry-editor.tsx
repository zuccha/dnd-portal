import { VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedMetamagic } from "~/models/resources/metamagics/localized-metamagic";
import Field from "~/ui/field";
import Input from "~/ui/input";
import ResourcePrintDeckEntryEditor from "./resource-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Metamagic Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function MetamagicPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedMetamagic>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <ResourcePrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <VStack align="stretch" gap={3}>
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
        <Field label={t("sorcery_points")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("sorceryPoints", {
                ...localizedResource.sorceryPoints,
                valueWithLabel: value,
              })
            }
            placeholder={t("sorcery_points.placeholder")}
            value={localizedResource.sorceryPoints.valueWithLabel}
          />
        </Field>
      </VStack>
    </ResourcePrintDeckEntryEditor>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "prerequisite": {
    en: "Prerequisite",
    it: "Prerequisito",
  },
  "prerequisite.placeholder": {
    en: "E.g. Charisma 13 or higher",
    it: "Es. Carisma 13 o superiore",
  },
  "sorcery_points": {
    en: "Sorcery Points",
    it: "Punti Stregoneria",
  },
  "sorcery_points.placeholder": {
    en: "E.g. 2 Sorcery Points",
    it: "Es. 2 Punti Stregoneria",
  },
};
