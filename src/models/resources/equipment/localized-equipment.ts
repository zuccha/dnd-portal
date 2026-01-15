import { useCallback } from "react";
import z, { ZodType } from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { useFormatGrams } from "~/measures/weight";
import { useTranslateEquipmentRarity } from "../../types/equipment-rarity";
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
    magic_type: z.string(),
    notes: z.string(),
    rarity: z.string(),
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
  const { lang, t, ti } = useI18nLangContext(i18nContext);

  const formatWeight = useFormatGrams();
  const formatCost = useFormatCp();
  const translateRarity = useTranslateEquipmentRarity(lang);

  return useCallback(
    (equipment: E): LocalizedEquipment<E> => {
      const rarity = translateRarity(equipment.rarity).label;

      return {
        ...localizeResource(equipment),

        cost: formatCost(equipment.cost).toUpperCase(),
        magic: equipment.magic,
        magic_type:
          equipment.magic ?
            equipment.rarity === "artifact" ?
              t("magic_type.magic.artifact")
            : ti("magic_type.magic", rarity)
          : t("magic_type.non_magic"),
        notes: translate(equipment.notes, lang),
        rarity,
        weight: formatWeight(equipment.weight),
      };
    },
    [formatCost, formatWeight, lang, localizeResource, t, ti, translateRarity],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "magic_type.magic": {
    en: "<1> Magic Item",
    it: "Oggetto Magico <1>",
  },
  "magic_type.magic.artifact": {
    en: "Magic Artifact",
    it: "Artefatto Magico",
  },
  "magic_type.non_magic": {
    en: "Nonmagic Item",
    it: "Oggetto Non Magico",
  },
};
