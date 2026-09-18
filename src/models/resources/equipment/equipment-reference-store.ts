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
// Use Equipment Reference Resources
//------------------------------------------------------------------------------

const useActiveSourceReferenceArmorIds = armorResources.useActiveSourceReferenceResourceIds;
const useActiveSourceReferenceItemIds = itemResources.useActiveSourceReferenceResourceIds;
const useActiveSourceReferenceToolIds = toolResources.useActiveSourceReferenceResourceIds;
const useActiveSourceReferenceWeaponIds = weaponResources.useActiveSourceReferenceResourceIds;
const useArmorResources = armorResources.useResources;
const useItemResources = itemResources.useResources;
const useToolResources = toolResources.useResources;
const useWeaponResources = weaponResources.useResources;

function useEquipmentReferenceResources(): Equipment[] {
  const armorIds = useActiveSourceReferenceArmorIds();
  const itemIds = useActiveSourceReferenceItemIds();
  const toolIds = useActiveSourceReferenceToolIds();
  const weaponIds = useActiveSourceReferenceWeaponIds();

  const armors = useArmorResources(armorIds);
  const items = useItemResources(itemIds);
  const tools = useToolResources(toolIds);
  const weapons = useWeaponResources(weaponIds);

  return useMemo(
    () => [...armors, ...items, ...tools, ...weapons],
    [armors, items, tools, weapons],
  );
}

//------------------------------------------------------------------------------
// Use Localized Equipment Names
//------------------------------------------------------------------------------

function useLocalizedEquipmentNames(lang: I18nLang): Record<string, string> {
  const equipments = useEquipmentReferenceResources();

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
  const equipments = useEquipmentReferenceResources();

  return useMemo(
    () =>
      equipments
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
    [equipments, lang],
  );
}

//------------------------------------------------------------------------------
// Equipment Reference Store
//------------------------------------------------------------------------------

export const equipmentReferenceStore = {
  useLocalizedEquipmentNames,
  useResourceOptions,
};
