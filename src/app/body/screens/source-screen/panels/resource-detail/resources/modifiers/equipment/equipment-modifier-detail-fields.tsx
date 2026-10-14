import { GridItem, SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { equipmentReferenceStore } from "~/models/resources/equipment/equipment-reference-store";
import type { EquipmentModifier } from "~/models/resources/modifiers/equipment/equipment-modifier";
import type { LocalizedEquipmentModifier } from "~/models/resources/modifiers/equipment/localized-equipment-modifier";
import ResourceDetailField from "../../../resource-detail-field";
import ResourceDetailLinks from "../../../resource-detail-links";

const { useLocalizedEquipmentEntries } = equipmentReferenceStore;

//------------------------------------------------------------------------------
// Equipment Modifier Detail Fields
//------------------------------------------------------------------------------

export default function EquipmentModifierDetailFields({
  resource,
}: {
  resource: LocalizedEquipmentModifier<EquipmentModifier>;
}) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const equipmentEntries = useLocalizedEquipmentEntries(lang);
  const equipment = resource._raw.equipment_ids
    .flatMap((id) => {
      const entry = equipmentEntries.find((equipmentEntry) => equipmentEntry.id === id);
      return entry ? [entry] : [];
    })
    .sort((a, b) => a.name.localeCompare(b.name, lang));
  const fields = [
    resource._raw.cost_delta !== 0 && [t("additional_cost"), resource.cost_delta],
    resource._raw.weight_delta !== 0 && [t("additional_weight"), resource.weight_delta],
    resource.make_magic && [t("magic"), resource.magic],
    resource.make_magic && [t("minimum_rarity"), resource.rarity_minimum],
    resource._raw.required_attunement_slots_minimum > 0 && [
      t("minimum_attunement_slots"),
      resource.required_attunement_slots_minimum,
    ],
  ].filter((field): field is [string, string] => Boolean(field));

  if (fields.length === 0 && equipment.length === 0) return null;

  return (
    <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
      {fields.map(([label, value]) => (
        <ResourceDetailField key={label} label={label}>
          {value}
        </ResourceDetailField>
      ))}
      {equipment.length > 0 && (
        <GridItem colSpan={{ base: 1, sm: 3 }}>
          <ResourceDetailField label={t("supported_equipment")}>
            <ResourceDetailLinks resources={equipment} />
          </ResourceDetailField>
        </GridItem>
      )}
    </SimpleGrid>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  additional_cost: { en: "Additional Cost", it: "Costo Addizionale" },
  additional_weight: { en: "Additional Weight", it: "Peso Addizionale" },
  magic: { en: "Magic", it: "Magico" },
  minimum_attunement_slots: { en: "Minimum Attunement Slots", it: "Slot Minimi di Sintonia" },
  minimum_rarity: { en: "Minimum Rarity", it: "Rarità Minima" },
  supported_equipment: { en: "Supported Equipment", it: "Equipaggiamento Supportato" },
};
