import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedArmor } from "~/models/resources/equipment/armors/localized-armor";
import Field from "~/ui/field";
import Input from "~/ui/input";
import EquipmentPrintDeckEntryEditor from "./equipment-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Armor Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function ArmorPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedArmor>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <EquipmentPrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <SimpleGrid columns={{ base: 1, sm: 3 }} gap={3}>
        <Field label={t("armor_class")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("armor_class", {
                ...localizedResource.armor_class,
                value,
              })
            }
            placeholder={t("armor_class.placeholder")}
            value={localizedResource.armor_class.value}
          />
        </Field>
        <Field label={t("requirements")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("requirements", {
                ...localizedResource.requirements,
                value,
              })
            }
            placeholder={t("requirements.placeholder")}
            value={localizedResource.requirements.value}
          />
        </Field>
        <Field label={t("stealth")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("stealth", { ...localizedResource.stealth, value })
            }
            placeholder={t("stealth.placeholder")}
            value={localizedResource.stealth.value}
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
  "armor_class": {
    en: "Armor Class",
    it: "Classe Armatura",
  },
  "armor_class.placeholder": {
    en: "E.g. 18",
    it: "Es. 18",
  },
  "requirements": {
    en: "Requirements",
    it: "Requisiti",
  },
  "requirements.placeholder": {
    en: "E.g. Strength 15",
    it: "Es. Forza 15",
  },
  "stealth": {
    en: "Stealth",
    it: "Furtività",
  },
  "stealth.placeholder": {
    en: "E.g. Disadvantage",
    it: "Es. Svantaggio",
  },
};
