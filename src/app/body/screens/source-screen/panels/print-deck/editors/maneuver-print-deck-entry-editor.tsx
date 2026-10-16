import { VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedManeuver } from "~/models/resources/maneuvers/localized-maneuver";
import Field from "~/ui/field";
import Input from "~/ui/input";
import ResourcePrintDeckEntryEditor from "./resource-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Maneuver Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function ManeuverPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedManeuver>) {
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
    en: "E.g. Strength 13 or higher",
    it: "Es. Forza 13 o superiore",
  },
};
