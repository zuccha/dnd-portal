import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import ResourceDetailField from "../../../resource-detail-field";
import EquipmentDetail from "../../equipment-detail";

type ArmorDetailResource = ReturnType<typeof armorStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Armor Detail
//------------------------------------------------------------------------------

export default function ArmorDetail({ resource }: { resource: ArmorDetailResource }) {
  const { t } = useI18nLangContext(i18nContext);
  const armor = resource;

  return (
    <EquipmentDetail resource={armor}>
      {armor && (
        <>
          <ResourceDetailField label={t("armor_class")}>{armor.armor_class}</ResourceDetailField>
          {armor.requirements && (
            <ResourceDetailField label={t("requirements")}>
              {armor.requirements}
            </ResourceDetailField>
          )}
          {armor.disadvantage_on_stealth && (
            <ResourceDetailField label={t("stealth")}>{armor.stealth}</ResourceDetailField>
          )}
        </>
      )}
    </EquipmentDetail>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  armor_class: { en: "Armor Class", it: "Classe Armatura" },
  requirements: { en: "Requirements", it: "Requisiti" },
  stealth: { en: "Stealth", it: "Furtività" },
};
