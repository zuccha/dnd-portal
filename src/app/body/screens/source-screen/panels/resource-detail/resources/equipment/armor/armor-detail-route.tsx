import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import ResourceDetailField from "../../../resource-detail-field";
import EquipmentDetailRoute from "../equipment-detail-route";

const useLocalizedResource = armorStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Armor Detail Route
//------------------------------------------------------------------------------

export default function ArmorDetailRoute({ resourceId }: { resourceId: string }) {
  const { t } = useI18nLangContext(i18nContext);
  const armor = useLocalizedResource(resourceId);

  return (
    <EquipmentDetailRoute resource={armor}>
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
    </EquipmentDetailRoute>
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
