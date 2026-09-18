import { useMemo } from "react";
import type { I18nLang } from "~/i18n/i18n-lang";
import { useI18nLang } from "~/i18n/i18n-lang";
import { translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import { compareObjects } from "~/utils/object";
import type { ResourceOption } from "../resource";
import type { Equipment } from "./equipment";

//------------------------------------------------------------------------------
// Catalogue Stores
//------------------------------------------------------------------------------

const armorResources = catalogue.createResourceStore("armor");
const itemResources = catalogue.createResourceStore("item");
const toolResources = catalogue.createResourceStore("tool");
const weaponResources = catalogue.createResourceStore("weapon");

//------------------------------------------------------------------------------
// Get Equipment
//------------------------------------------------------------------------------

function getEquipment(resourceId: string): Equipment | undefined {
  return (
    armorResources.getResource(resourceId) ??
    itemResources.getResource(resourceId) ??
    toolResources.getResource(resourceId) ??
    weaponResources.getResource(resourceId)
  );
}

//------------------------------------------------------------------------------
// Use Equipment Reference Ids
//------------------------------------------------------------------------------

const useActiveSourceReferenceArmorIds = armorResources.useActiveSourceReferenceResourceIds;
const useActiveSourceReferenceItemIds = itemResources.useActiveSourceReferenceResourceIds;
const useActiveSourceReferenceToolIds = toolResources.useActiveSourceReferenceResourceIds;
const useActiveSourceReferenceWeaponIds = weaponResources.useActiveSourceReferenceResourceIds;

function useEquipmentReferenceIds(): string[] {
  const armorIds = useActiveSourceReferenceArmorIds();
  const itemIds = useActiveSourceReferenceItemIds();
  const toolIds = useActiveSourceReferenceToolIds();
  const weaponIds = useActiveSourceReferenceWeaponIds();

  return useMemo(
    () => [...armorIds, ...itemIds, ...toolIds, ...weaponIds],
    [armorIds, itemIds, toolIds, weaponIds],
  );
}

//------------------------------------------------------------------------------
// Use Localized Equipment Names
//------------------------------------------------------------------------------

function useLocalizedEquipmentNames(lang: I18nLang): Record<string, string> {
  const resourceIds = useEquipmentReferenceIds();
  const equipments = useMemo(
    () =>
      resourceIds.flatMap((id) => {
        const equipment = getEquipment(id);
        return equipment ? [equipment] : [];
      }),
    [resourceIds],
  );

  return useMemo(
    () =>
      Object.fromEntries(
        equipments.map((equipment) => [equipment.id, translate(equipment.name, lang)]),
      ),
    [equipments, lang],
  );
}

//------------------------------------------------------------------------------
// Use Resource Options
//------------------------------------------------------------------------------

function useResourceOptions(): ResourceOption[] {
  const [lang] = useI18nLang();
  const resourceIds = useEquipmentReferenceIds();

  return useMemo(
    () =>
      resourceIds
        .map((id) => getEquipment(id))
        .filter((equipment): equipment is Equipment => !!equipment)
        .map((equipment) => {
          const label = translate(equipment.name, lang);
          return {
            label,
            name: equipment.name,
            name_short: equipment.name_short,
            value: equipment.id,
          };
        })
        .sort(compareObjects("label")),
    [lang, resourceIds],
  );
}

//------------------------------------------------------------------------------
// Equipment Reference Store
//------------------------------------------------------------------------------

export const equipmentReferenceStore = {
  useLocalizedEquipmentNames,
  useResourceOptions,
};
