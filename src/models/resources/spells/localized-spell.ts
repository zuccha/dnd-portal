import { useMemo } from "react";
import { z } from "zod";
import { translate } from "~/i18n/i18n-string";
import { useFormatCm } from "~/measures/distance";
import { useFormatSeconds } from "~/measures/time";
import { heading } from "../../../ui/rich-text-page";
import { useTranslateSpellCastingTime } from "../../types/spell-casting-time";
import { useTranslateSpellDuration } from "../../types/spell-duration";
import { useTranslateSpellRange } from "../../types/spell-range";
import { useTranslateSpellSchool } from "../../types/spell-school";
import { characterClassStore } from "../character-classes/character-class-store";
import {
  type LocalizedResourceLink,
  type ResourceLocalizationContext,
  formatDescription,
  localizeResource,
  localizedFieldSchema,
  localizedResourceLinkSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Spell, spellSchema } from "./spell";
import type { RelatedResourceEntries } from "../../catalogue/resource-relations";

const useCharacterClassResources = characterClassStore.useResources;

//------------------------------------------------------------------------------
// Localized Spell
//------------------------------------------------------------------------------

export const localizedSpellSchema = localizedResourceSchema(spellSchema, z.literal("spell")).extend(
  {
    casting_time: localizedFieldSchema.extend({ value_with_ritual: z.string() }),
    character_class_abbreviations: z.string(),
    character_classes: z.array(
      localizedResourceLinkSchema(z.literal("character_class")).extend({
        abbreviation: z.string().optional(),
      }),
    ),
    character_classes_label: z.string(),
    components: localizedFieldSchema,
    concentration: z.boolean(),
    emphasize_casting_time: z.boolean(),
    duration: localizedFieldSchema.extend({ value_with_concentration: z.string() }),
    level: z.string(),
    materials: localizedFieldSchema,
    range: localizedFieldSchema,
    ritual: z.boolean(),
    school: z.string(),
  },
);

export type LocalizedSpell = z.infer<typeof localizedSpellSchema>;

//------------------------------------------------------------------------------
// Spell Localization Context
//------------------------------------------------------------------------------

type SpellLocalizationContext = ResourceLocalizationContext & {
  characterClasses: (LocalizedResourceLink<"character_class"> & { abbreviation?: string })[];
  formatRange: ReturnType<typeof useFormatCm>;
  formatTime: ReturnType<typeof useFormatSeconds>;
  localizedCharacterClassAbbreviations: Record<string, string>;
  translateSpellCastingTime: (value: Spell["casting_time"]) => string;
  translateSpellDuration: (value: Spell["duration"]) => string;
  translateSpellRange: (value: Spell["range"]) => string;
  translateSpellSchool: (value: Spell["school"]) => string;
};

//------------------------------------------------------------------------------
// Use Spell Localization Context
//------------------------------------------------------------------------------

export function useSpellLocalizationContext(
  _spell: Spell,
  related: RelatedResourceEntries<"spell">,
): SpellLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const translateSpellSchool = useTranslateSpellSchool(context.lang);
  const translateSpellCastingTime = useTranslateSpellCastingTime(context.lang);
  const translateSpellDuration = useTranslateSpellDuration(context.lang);
  const translateSpellRange = useTranslateSpellRange(context.lang);
  const formatRange = useFormatCm();
  const formatTime = useFormatSeconds();
  const characterClassIds = useMemo(
    () => related.character_classes.map(({ id }) => id),
    [related.character_classes],
  );
  const characterClassResources = useCharacterClassResources(characterClassIds);
  const characterClasses = useMemo(
    () =>
      related.character_classes.flatMap(({ id }) => {
        const resource = characterClassResources.find((entry) => entry.id === id);
        return resource
          ? [
              {
                abbreviation: `${translate(resource.abbreviation, context.lang)}.`,
                id,
                kind: "character_class" as const,
                name: translate(resource.name, context.lang),
              },
            ]
          : [];
      }),
    [characterClassResources, context.lang, related.character_classes],
  );
  const localizedCharacterClassAbbreviations = useMemo(
    () =>
      Object.fromEntries(
        characterClassResources.map(({ abbreviation, id }) => [
          id,
          translate(abbreviation, context.lang),
        ]),
      ),
    [characterClassResources, context.lang],
  );

  return useMemo(
    () => ({
      ...context,
      characterClasses,
      formatRange,
      formatTime,
      localizedCharacterClassAbbreviations,
      translateSpellCastingTime,
      translateSpellDuration,
      translateSpellRange,
      translateSpellSchool,
    }),
    [
      context,
      characterClasses,
      formatRange,
      formatTime,
      localizedCharacterClassAbbreviations,
      translateSpellCastingTime,
      translateSpellDuration,
      translateSpellRange,
      translateSpellSchool,
    ],
  );
}

//------------------------------------------------------------------------------
// Localize Spell
//------------------------------------------------------------------------------

export function localizeSpell(spell: Spell, context: SpellLocalizationContext): LocalizedSpell {
  const castingTime = spell.casting_time_value
    ? context.formatTime(spell.casting_time_value)
    : context.translateSpellCastingTime(spell.casting_time);

  const characterClassAbbreviations = context.characterClasses
    .map(({ id }) => context.localizedCharacterClassAbbreviations[id] ?? "")
    .map((characterClass) => `${characterClass}.`)
    .sort((a, b) => a.localeCompare(b, context.lang))
    .join(" ");

  const durationValue = spell.duration_value
    ? context.formatTime(spell.duration_value)
    : context.translateSpellDuration(spell.duration);

  const rangeValue = spell.range_value
    ? context.formatRange(spell.range_value)
    : context.translateSpellRange(spell.range);

  const details = translate(spell.description, context.lang);
  const upgrade = spell.upgrade ? translate(spell.upgrade, context.lang) : "";
  const materialsValue = spell.materials ? translate(spell.materials, context.lang) : "";
  const school = context.translateSpellSchool(spell.school);

  return {
    ...localizeResource(spell, context),
    descriptor: context.tpi("subtitle", spell.level, school, `${spell.level}`),
    casting_time: {
      label: context.t("casting_time"),
      value: castingTime,
      value_with_ritual: spell.has_ritual
        ? context.ti("casting_time_with_ritual", castingTime)
        : castingTime,
    },
    character_class_abbreviations: characterClassAbbreviations,
    character_classes: context.characterClasses,
    character_classes_label: context.t("classes"),
    components: {
      label: context.t("components"),
      value:
        [spell.is_verbal ? "V" : "", spell.is_somatic ? "S" : "", spell.is_material ? "M" : ""]
          .filter((component) => component)
          .join(", ") || "—",
    },
    concentration: spell.has_concentration,
    emphasize_casting_time:
      spell.casting_time === "bonus_action" || spell.casting_time === "reaction",
    description: formatDescription(
      details,
      upgrade ? `${context.tp("upgrade", spell.level)}\r${upgrade}` : "",
    ),
    duration: {
      label: context.t("duration"),
      value: spell.has_concentration ? context.ti("duration_up_to", durationValue) : durationValue,
      value_with_concentration: spell.has_concentration
        ? context.ti("duration_with_concentration", durationValue)
        : durationValue,
    },
    level: `${spell.level}`,
    materials: {
      label: context.t("materials"),
      value: materialsValue,
    },
    range: {
      label: context.t("range"),
      value: rangeValue,
    },
    ritual: spell.has_ritual,
    school,
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "casting_time": {
    en: "Casting",
    it: "Lancio",
  },
  "casting_time_with_ritual": {
    en: "<1> or ritual", // 1 = casting time
    it: "<1> o rituale", // 1 = casting time
  },
  "classes": {
    en: "Classes",
    it: "Classi",
  },
  "components": {
    en: "Components",
    it: "Componenti",
  },
  "duration_up_to": {
    en: "Up to <1>", // <1> = duration
    it: "Fino a <1>", // <1> = duration
  },
  "duration_with_concentration": {
    en: "Up to <1> (concentration)", // <1> = duration
    it: "Fino a <1> (concentrazione)", // <1> = duration
  },
  "duration": {
    en: "Duration",
    it: "Durata",
  },
  "materials": {
    en: "Materials",
    it: "Materiali",
  },
  "range": {
    en: "Range",
    it: "Gittata",
  },
  "subtitle/*": {
    en: "Level <2> <1>", // 1 = school, 2 = level
    it: "<1> di <2>° livello", // 1 = school, 2 = level
  },
  "subtitle/0": {
    en: "<1> Cantrip", // 1 = school
    it: "Trucchetto di <1>", // 1 = school
  },
  "upgrade/*": {
    en: heading("At Higher Levels"),
    it: heading("A Livelli Superiori"),
  },
  "upgrade/0": {
    en: heading("Cantrip Upgrade"),
    it: heading("Potenziamento del Trucchetto"),
  },
};
