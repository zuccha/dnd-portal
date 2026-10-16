import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedArmorModifier } from "~/models/resources/modifiers/equipment/armors/localized-armor-modifier";
import type { LocalizedItemModifier } from "~/models/resources/modifiers/equipment/items/localized-item-modifier";
import type { LocalizedToolModifier } from "~/models/resources/modifiers/equipment/tools/localized-tool-modifier";
import type { LocalizedWeaponModifier } from "~/models/resources/modifiers/equipment/weapons/localized-weapon-modifier";
import Field from "~/ui/field";
import Input from "~/ui/input";
import ResourcePrintDeckEntryEditor from "./resource-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Equipment Modifier Print Deck Entry Editor
//------------------------------------------------------------------------------

type LocalizedEquipmentModifier =
  | LocalizedArmorModifier
  | LocalizedItemModifier
  | LocalizedToolModifier
  | LocalizedWeaponModifier;

export default function EquipmentModifierPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedEquipmentModifier>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <ResourcePrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        <Field label={t("cost_delta")}>
          <Input
            onValueChange={(value) => onLocalizedResourceUpdate("costDelta", value)}
            placeholder={t("cost_delta.placeholder")}
            value={localizedResource.costDelta}
          />
        </Field>
        <Field label={t("weight_delta")}>
          <Input
            onValueChange={(value) => onLocalizedResourceUpdate("weightDelta", value)}
            placeholder={t("weight_delta.placeholder")}
            value={localizedResource.weightDelta}
          />
        </Field>
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, sm: 3 }} gap={3}>
        <Field label={t("magic")}>
          <Input
            onValueChange={(value) => onLocalizedResourceUpdate("magic", value)}
            placeholder={t("magic.placeholder")}
            value={localizedResource.magic}
          />
        </Field>
        <Field label={t("minimum_rarity")}>
          <Input
            onValueChange={(value) => onLocalizedResourceUpdate("rarityMinimum", value)}
            placeholder={t("minimum_rarity.placeholder")}
            value={localizedResource.rarityMinimum}
          />
        </Field>
        <Field label={t("minimum_attunement")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("requiredAttunementSlotsMinimum", value)
            }
            placeholder={t("minimum_attunement.placeholder")}
            value={localizedResource.requiredAttunementSlotsMinimum}
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
  "cost_delta": {
    en: "Cost Change",
    it: "Variazione Costo",
  },
  "cost_delta.placeholder": {
    en: "E.g. 10 gp",
    it: "Es. 10 mo",
  },
  "magic": {
    en: "Magic",
    it: "Magico",
  },
  "magic.placeholder": {
    en: "E.g. Magical",
    it: "Es. Magico",
  },
  "minimum_attunement": {
    en: "Minimum Attunement",
    it: "Sintonia Minima",
  },
  "minimum_attunement.placeholder": {
    en: "E.g. 2 attunement slots",
    it: "Es. 2 slot sintonia",
  },
  "minimum_rarity": {
    en: "Minimum Rarity",
    it: "Rarità Minima",
  },
  "minimum_rarity.placeholder": {
    en: "E.g. Rare",
    it: "Es. Raro",
  },
  "weight_delta": {
    en: "Weight Change",
    it: "Variazione Peso",
  },
  "weight_delta.placeholder": {
    en: "E.g. 2 lb",
    it: "Es. 1 kg",
  },
};
