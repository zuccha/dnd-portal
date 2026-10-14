import EquipmentDetail from "~/app/body/screens/source-screen/panels/resources/equipment/detail/equipment-detail";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { equipmentReferenceStore } from "~/models/resources/equipment/equipment-reference-store";
import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import ResourceDetailField from "../../../detail/resource-detail-field";
import ResourceDetailLinks from "../../../detail/resource-detail-links";

type WeaponDetailResource = ReturnType<typeof weaponStore.useLocalizedResource>;
const { useLocalizedEquipmentEntries } = equipmentReferenceStore;

//------------------------------------------------------------------------------
// Weapon Detail
//------------------------------------------------------------------------------

export default function WeaponDetail({ resource }: { resource: WeaponDetailResource }) {
  const { lang, t, ti } = useI18nLangContext(i18nContext);
  const weapon = resource;
  const equipmentEntries = useLocalizedEquipmentEntries(lang);
  const ammunition = weapon
    ? weapon._raw.ammunition_ids.flatMap((id) => {
        const entry = equipmentEntries.find((equipmentEntry) => equipmentEntry.id === id);
        return entry ? [entry] : [];
      })
    : [];

  return (
    <EquipmentDetail resource={weapon}>
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
          {ammunition.length > 0 && (
            <ResourceDetailField label={t("ammunition")}>
              <ResourceDetailLinks resources={ammunition} />
            </ResourceDetailField>
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
  ammunition: { en: "Ammunition", it: "Munizioni" },
  damage: { en: "Damage", it: "Danni" },
  damage_extended: { en: "<1> <2>", it: "<1> <2>" },
  properties: { en: "Properties", it: "Proprietà" },
  range: { en: "Range", it: "Gittata" },
  versatile: { en: "Two-Handed Damage", it: "Danni a Due Mani" },
};
