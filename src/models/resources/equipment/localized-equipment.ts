import { useCallback } from "react";
import z, { ZodType } from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { useFormatGrams } from "~/measures/weight";
import { useFormatFeatureEntries } from "../../other/feature-entries";
import { useTranslateEquipmentRarity } from "../../types/equipment-rarity";
import {
  formatDetails,
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
    rarity: z.string(),
    weight: z.string(),
  });

export type LocalizedEquipment<E extends Equipment> = z.infer<
  ReturnType<typeof localizedEquipmentSchema<E>>
>;

//------------------------------------------------------------------------------
// Use Localized Equipment
//------------------------------------------------------------------------------

export function useLocalizeEquipment<E extends Equipment>(
  sourceId: string,
): (equipment: E) => LocalizedEquipment<E> {
  const localizeResource = useLocalizeResource<E>();
  const { lang, t, ti, tpi } = useI18nLangContext(i18nContext);

  const formatWeight = useFormatGrams();
  const formatCost = useFormatCp();
  const formatFeatureEntriesDetails = useFormatFeatureEntries(sourceId);
  const translateRarity = useTranslateEquipmentRarity(lang);

  return useCallback(
    (equipment: E): LocalizedEquipment<E> => {
      const rarity = translateRarity(equipment.rarity).label;
      const attunementNotes = translate(equipment.attunement_notes, lang);
      const attunementSlots = equipment.required_attunement_slots;
      const attunement =
        equipment.magic && attunementSlots > 0 ?
          attunementNotes ?
            tpi(
              "attunement.with_notes",
              attunementSlots,
              `${attunementSlots}`,
              attunementNotes,
            )
          : tpi("attunement", attunementSlots, `${attunementSlots}`)
        : "";
      const notes = translate(equipment.notes, lang);
      const features = formatFeatureEntriesDetails(equipment.feature_entries);

      return {
        ...localizeResource(equipment),
        details: formatDetails(attunement, notes, features),

        cost: formatCost(equipment.cost),
        magic: equipment.magic,
        magic_type:
          equipment.magic ?
            equipment.rarity === "artifact" ?
              t("magic_type.magic.artifact")
            : ti("magic_type.magic", rarity)
          : t("magic_type.non_magic"),
        rarity,
        weight: formatWeight(equipment.weight),
      };
    },
    [
      formatCost,
      formatFeatureEntriesDetails,
      formatWeight,
      lang,
      localizeResource,
      t,
      ti,
      tpi,
      translateRarity,
    ],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "attunement.with_notes/*": {
    en: "_Requires attunement <2> (<1> slots)._",
    it: "_Richiede sintonia <2> (<1> slot)._",
  },
  "attunement.with_notes/1": {
    en: "_Requires attunement <2>._",
    it: "_Richiede sintonia <2>._",
  },
  "attunement/*": {
    en: "_Requires attunement (<1> slots)._",
    it: "_Richiede sintonia (<1> slot)._",
  },
  "attunement/1": {
    en: "_Requires attunement._",
    it: "_Richiede sintonia._",
  },
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
