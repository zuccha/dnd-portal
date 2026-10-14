import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { equipmentReferenceStore } from "~/models/resources/equipment/equipment-reference-store";
import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import ResourceDetailField from "../../../resource-detail-field";
import EquipmentDetailRoute from "../equipment-detail-route";

const useLocalizedResource = weaponStore.useLocalizedResource;
const useLocalizedEquipmentNames = equipmentReferenceStore.useLocalizedEquipmentNames;

//------------------------------------------------------------------------------
// Weapon Detail Route
//------------------------------------------------------------------------------

export default function WeaponDetailRoute({ resourceId }: { resourceId: string }) {
  const { lang, t, ti } = useI18nLangContext(i18nContext);
  const weapon = useLocalizedResource(resourceId);
  const equipmentNames = useLocalizedEquipmentNames(lang);
  const ammunition = weapon
    ? weapon._raw.ammunition_ids
        .map((id) => equipmentNames[id] ?? "")
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <EquipmentDetailRoute resource={weapon}>
      {weapon && (
        <>
          <ResourceDetailField label={t("damage")}>{weapon.damage_extended}</ResourceDetailField>
          {weapon.damage_versatile && (
            <ResourceDetailField label={t("versatile")}>
              {ti("damage_extended", weapon.damage_versatile, weapon.damage_type)}
            </ResourceDetailField>
          )}
          {weapon.ranged && weapon.range && (
            <ResourceDetailField label={t("range")}>{weapon.range}</ResourceDetailField>
          )}
          {weapon.properties && (
            <ResourceDetailField label={t("properties")}>{weapon.properties}</ResourceDetailField>
          )}
          {ammunition && (
            <ResourceDetailField label={t("ammunition")}>{ammunition}</ResourceDetailField>
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
  ammunition: { en: "Ammunition", it: "Munizioni" },
  damage: { en: "Damage", it: "Danni" },
  damage_extended: { en: "<1> <2>", it: "<1> <2>" },
  properties: { en: "Properties", it: "Proprietà" },
  range: { en: "Range", it: "Gittata" },
  versatile: { en: "Two-Handed Damage", it: "Danni a Due Mani" },
};
