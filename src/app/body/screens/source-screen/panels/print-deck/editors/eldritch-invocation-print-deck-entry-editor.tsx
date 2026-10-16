import { VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedEldritchInvocation } from "~/models/resources/eldritch-invocations/localized-eldritch-invocation";
import Field from "~/ui/field";
import Input from "~/ui/input";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Eldritch Invocation Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function EldritchInvocationPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedEldritchInvocation>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <VStack align="stretch" gap={3}>
      <Field label={localizedResource.minWarlockLevel.label}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("minWarlockLevel", {
              ...localizedResource.minWarlockLevel,
              valueWithLabel: value,
            })
          }
          placeholder={t("min_warlock_level.placeholder")}
          value={localizedResource.minWarlockLevel.valueWithLabel}
        />
      </Field>
      <Field label={localizedResource.otherPrerequisite.label}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("otherPrerequisite", {
              ...localizedResource.otherPrerequisite,
              value,
            })
          }
          placeholder={t("prerequisite.placeholder")}
          value={localizedResource.otherPrerequisite.value}
        />
      </Field>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "min_warlock_level.placeholder": {
    en: "E.g. Level 5 Warlock",
    it: "Es. Warlock di 5° livello",
  },
  "prerequisite.placeholder": {
    en: "E.g. Pact of the Blade feature",
    it: "Es. Privilegio Patto della Lama",
  },
};
