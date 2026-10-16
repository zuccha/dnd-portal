import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import Field from "~/ui/field";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import EquipmentPrintDeckEntryEditor from "./equipment-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Item Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function ItemPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedItem>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <EquipmentPrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <SimpleGrid columns={{ base: 1, sm: 3 }} gap={3}>
        <Field label={t("uses_label")}>
          <Input
            onValueChange={(label) =>
              onLocalizedResourceUpdate("uses", { ...localizedResource.uses, label })
            }
            placeholder={t("uses_label.placeholder")}
            value={localizedResource.uses.label}
          />
        </Field>
        <Field label={t("uses_value")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("uses", { ...localizedResource.uses, value })
            }
            placeholder={t("uses_value.placeholder")}
            value={localizedResource.uses.value}
          />
        </Field>
        <Field label={t("uses_count")}>
          <NumberInput
            disabled={!!localizedResource.uses.value.length}
            inputProps={{ placeholder: t("uses_count.placeholder") }}
            min={0}
            onValueChange={(count) =>
              onLocalizedResourceUpdate("uses", { ...localizedResource.uses, count })
            }
            value={localizedResource.uses.count}
          />
        </Field>
      </SimpleGrid>
    </EquipmentPrintDeckEntryEditor>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "uses_count": {
    en: "Number of Uses",
    it: "Numero di Utilizzi",
  },
  "uses_count.placeholder": {
    en: "E.g. 3",
    it: "Es. 3",
  },
  "uses_label": {
    en: "Uses Label",
    it: "Etichetta Utilizzi",
  },
  "uses_label.placeholder": {
    en: "E.g. Consumable",
    it: "Es. Consumabile",
  },
  "uses_value": {
    en: "Uses Text",
    it: "Testo Utilizzi",
  },
  "uses_value.placeholder": {
    en: "E.g. One usage",
    it: "Es. Un utilizzo",
  },
};
