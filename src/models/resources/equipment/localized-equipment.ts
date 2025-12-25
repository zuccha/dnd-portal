import { useCallback } from "react";
import z, { ZodType } from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useFormatCpWithUnit } from "~/measures/cost";
import { useFormatGrams } from "~/measures/weight";
import {
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type Equipment } from "./equipment";

//------------------------------------------------------------------------------
// Localized Equipment
//------------------------------------------------------------------------------

export const localizedEquipmentSchema = <E extends Equipment>(
  rawSchema: ZodType<E>,
) =>
  localizedResourceSchema(rawSchema).extend({
    cost: z.string(),
    magic: z.boolean(),
    notes: z.string(),
    weight: z.string(),
  });

export type LocalizedEquipment<E extends Equipment> = z.infer<
  ReturnType<typeof localizedEquipmentSchema<E>>
>;

//------------------------------------------------------------------------------
// Use Localized Equipment
//------------------------------------------------------------------------------

export function useLocalizeEquipment<E extends Equipment>(): (
  equipment: E,
) => LocalizedEquipment<E> {
  const localizeResource = useLocalizeResource<E>();
  const { lang } = useI18nLangContext(i18nContext);

  const formatWeight = useFormatGrams();
  const formatCost = useFormatCpWithUnit("gp");

  return useCallback(
    (equipment: E): LocalizedEquipment<E> => {
      return {
        ...localizeResource(equipment),

        cost: formatCost(equipment.cost).toUpperCase(),
        magic: equipment.magic,
        notes: translate(equipment.notes, lang),
        weight: formatWeight(equipment.weight),
      };
    },
    [formatCost, formatWeight, lang, localizeResource],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {};
