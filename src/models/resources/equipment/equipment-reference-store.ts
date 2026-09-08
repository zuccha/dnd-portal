import { useCallback, useMemo } from "react";
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

function useEquipmentReferenceIds(): string[] {
  const armorIds = armorResources.useActiveSourceReferenceResourceIds();
  const itemIds = itemResources.useActiveSourceReferenceResourceIds();
  const toolIds = toolResources.useActiveSourceReferenceResourceIds();
  const weaponIds = weaponResources.useActiveSourceReferenceResourceIds();

  return useMemo(
    () => [...armorIds, ...itemIds, ...toolIds, ...weaponIds],
    [armorIds, itemIds, toolIds, weaponIds],
  );
}

//------------------------------------------------------------------------------
// Use Localize Resource Name
//------------------------------------------------------------------------------

function useLocalizeResourceName(
  _sourceId: string,
  lang: string,
): (resourceId: string) => string {
  const resourceIds = useEquipmentReferenceIds();

  return useCallback(
    (resourceId: string) => {
      const equipment = getEquipment(resourceId);
      return equipment ? translate(equipment.name, lang) : "";
    },
    [lang, resourceIds], // eslint-disable-line react-hooks/exhaustive-deps
  );
}

//------------------------------------------------------------------------------
// Use Resource Options
//------------------------------------------------------------------------------

function useResourceOptions(_sourceId: string): ResourceOption[] {
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
  useLocalizeResourceName,
  useResourceOptions,
};
