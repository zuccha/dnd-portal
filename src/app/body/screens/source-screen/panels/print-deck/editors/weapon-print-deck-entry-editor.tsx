import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedWeapon } from "~/models/resources/equipment/weapons/localized-weapon";
import Field from "~/ui/field";
import Input from "~/ui/input";
import EquipmentPrintDeckEntryEditor from "./equipment-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Weapon Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function WeaponPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedWeapon>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <EquipmentPrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <Field label={t("properties")}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("properties", { ...localizedResource.properties, value })
          }
          placeholder={t("properties.placeholder")}
          value={localizedResource.properties.value}
        />
      </Field>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        <Field label={t("damage_type")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("damage_type", {
                ...localizedResource.damage_type,
                label: value,
              })
            }
            placeholder={t("damage_type.placeholder")}
            value={localizedResource.damage_type.label}
          />
        </Field>
        <Field label={t("damage")}>
          <Input
            onValueChange={(value) => onLocalizedResourceUpdate("damage_line", value)}
            placeholder={t("damage.placeholder")}
            value={localizedResource.damage_line}
          />
        </Field>
        <Field label={t("range")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("range", { ...localizedResource.range, value })
            }
            placeholder={t("range.placeholder")}
            value={localizedResource.range.value}
          />
        </Field>
        <Field label={t("ammunition")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("ammunition", { ...localizedResource.ammunition, value })
            }
            placeholder={t("ammunition.placeholder")}
            value={localizedResource.ammunition.value}
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
  "ammunition": {
    en: "Ammunition",
    it: "Munizioni",
  },
  "ammunition.placeholder": {
    en: "E.g. Arrows",
    it: "Es. Frecce",
  },
  "damage": {
    en: "Damage",
    it: "Danni",
  },
  "damage.placeholder": {
    en: "E.g. 1d8 + 4",
    it: "Es. 1d8 + 4",
  },
  "damage_type": {
    en: "Damage Type",
    it: "Tipo di Danno",
  },
  "damage_type.placeholder": {
    en: "E.g. Slashing Damage",
    it: "Es. Danni Taglienti",
  },
  "properties": {
    en: "Properties",
    it: "Proprietà",
  },
  "properties.placeholder": {
    en: "E.g. Heavy, Two-Handed",
    it: "Es. Pesante, A Due Mani",
  },
  "range": {
    en: "Range",
    it: "Gittata",
  },
  "range.placeholder": {
    en: "E.g. 80/320 ft",
    it: "Es. 24/96 m",
  },
};
