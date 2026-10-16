import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedService } from "~/models/resources/services/localized-service";
import Field from "~/ui/field";
import Input from "~/ui/input";
import ResourcePrintDeckEntryEditor from "./resource-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Service Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function ServicePrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedService>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <ResourcePrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        <Field label={t("availability")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("availability", {
                ...localizedResource.availability,
                value,
              })
            }
            placeholder={t("availability.placeholder")}
            value={localizedResource.availability.value}
          />
        </Field>
        <Field label={t("price")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("price", { ...localizedResource.price, value })
            }
            placeholder={t("price.placeholder")}
            value={localizedResource.price.value}
          />
        </Field>
      </SimpleGrid>
    </ResourcePrintDeckEntryEditor>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "availability": {
    en: "Availability",
    it: "Disponibilità",
  },
  "availability.placeholder": {
    en: "E.g. Always available",
    it: "Es. Sempre disponibile",
  },
  "price": {
    en: "Price",
    it: "Prezzo",
  },
  "price.placeholder": {
    en: "E.g. 5 gp per day",
    it: "Es. 5 mo al giorno",
  },
};
