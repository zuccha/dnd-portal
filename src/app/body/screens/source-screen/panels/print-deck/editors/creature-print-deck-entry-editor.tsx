import { HStack, SimpleGrid, Span, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedCreature } from "~/models/resources/creatures/localized-creature";
import type { CreatureAbility } from "~/models/types/creature-ability";
import Field from "~/ui/field";
import Input from "~/ui/input";
import Switch from "~/ui/switch";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Creature Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function CreaturePrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedCreature>) {
  const { t, ti } = useI18nLangContext(i18nContext);
  const summonedFromSpell = localizedResource.summonedFromSpell;

  const updateExperience = (update: Partial<typeof localizedResource.experience>) => {
    const experience = { ...localizedResource.experience, ...update };
    const valueWithLair =
      experience.lair.value && experience.value !== experience.lair.value
        ? ti("experience.with_lair", experience.value, experience.lair.value)
        : experience.value;
    onLocalizedResourceUpdate("experience", { ...experience, valueWithLair });
  };

  const abilities: CreatureAbility[] = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
  ];

  return (
    <VStack align="stretch" gap={3}>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        <Field label={localizedResource.armorClass.label}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("armorClass", { ...localizedResource.armorClass, value })
            }
            placeholder={t("number.placeholder")}
            value={localizedResource.armorClass.value}
          />
        </Field>
        <Field label={localizedResource.hitPoints.label}>
          <HStack>
            <Input
              onValueChange={(value) =>
                onLocalizedResourceUpdate("hitPoints", {
                  ...localizedResource.hitPoints,
                  value,
                })
              }
              placeholder={t("number.placeholder")}
              value={localizedResource.hitPoints.value}
            />
            <Input
              disabled={summonedFromSpell}
              onValueChange={(formula) =>
                onLocalizedResourceUpdate("hitPoints", {
                  ...localizedResource.hitPoints,
                  formula,
                })
              }
              placeholder={t("formula.placeholder")}
              value={localizedResource.hitPoints.formula}
            />
          </HStack>
        </Field>
        <Field label={localizedResource.proficiencyBonus.label}>
          <Input
            disabled={summonedFromSpell}
            onValueChange={(value) =>
              onLocalizedResourceUpdate("proficiencyBonus", {
                ...localizedResource.proficiencyBonus,
                value,
              })
            }
            placeholder={t("proficiency_bonus.placeholder")}
            value={localizedResource.proficiencyBonus.value}
          />
        </Field>
        <Field label={localizedResource.challengeRating.label}>
          <Input
            disabled={summonedFromSpell}
            onValueChange={(value) =>
              onLocalizedResourceUpdate("challengeRating", {
                ...localizedResource.challengeRating,
                value,
              })
            }
            placeholder={t("challenge_rating.placeholder")}
            value={localizedResource.challengeRating.value}
          />
        </Field>
        <HStack align="flex-start" gridColumn={{ base: "auto", sm: "span 2", xl: "span 6" }}>
          <HStack align="flex-end" flex={1}>
            <Field label={localizedResource.experience.label}>
              <Input
                disabled={summonedFromSpell}
                onValueChange={(value) => updateExperience({ value })}
                placeholder={t("experience.placeholder")}
                value={localizedResource.experience.value}
              />
            </Field>
            <Field label={localizedResource.experience.lair.label}>
              <Input
                disabled={summonedFromSpell}
                onValueChange={(value) =>
                  updateExperience({
                    lair: { ...localizedResource.experience.lair, value },
                  })
                }
                placeholder={t("lair_experience.placeholder")}
                value={localizedResource.experience.lair.value}
              />
            </Field>
          </HStack>
          <VStack align="stretch" flex={1} gap={1}>
            <Field label={t("spell_level_legend")}>
              <Input
                disabled={!localizedResource.summonedFromSpell}
                onValueChange={(value) => onLocalizedResourceUpdate("spellLevelLegend", value)}
                placeholder={t("spell_level_legend.placeholder")}
                value={localizedResource.spellLevelLegend}
              />
            </Field>
            <Switch
              label={t("summoned_from_spell")}
              onValueChange={(value) => onLocalizedResourceUpdate("summonedFromSpell", value)}
              value={summonedFromSpell}
            />
          </VStack>
        </HStack>
      </SimpleGrid>

      <VStack align="stretch" gap={2}>
        <SimpleGrid columns={4} gap={2}>
          <Span />
          <Span fontSize="sm">{t("score")}</Span>
          <Span fontSize="sm">{t("modifier")}</Span>
          <Span fontSize="sm">{t("save")}</Span>
        </SimpleGrid>
        {abilities.map((ability) => {
          const score = localizedResource.abilityScores[ability];

          return (
            <SimpleGrid columns={4} gap={2} key={ability}>
              <Span alignSelf="center">{score.label}</Span>
              <Input
                aria-label={`${score.label} ${t("score")}`}
                onValueChange={(value) =>
                  onLocalizedResourceUpdate("abilityScores", {
                    ...localizedResource.abilityScores,
                    [ability]: { ...score, score: value },
                  })
                }
                placeholder={t("number.placeholder")}
                value={score.score}
              />
              <Input
                aria-label={`${score.label} ${t("modifier")}`}
                onValueChange={(value) =>
                  onLocalizedResourceUpdate("abilityScores", {
                    ...localizedResource.abilityScores,
                    [ability]: { ...score, modifier: value },
                  })
                }
                placeholder={t("modifier.placeholder")}
                value={score.modifier}
              />
              <Input
                aria-label={`${score.label} ${t("save")}`}
                onValueChange={(value) =>
                  onLocalizedResourceUpdate("abilityScores", {
                    ...localizedResource.abilityScores,
                    [ability]: { ...score, save: value },
                  })
                }
                placeholder={t("modifier.placeholder")}
                value={score.save}
              />
            </SimpleGrid>
          );
        })}
      </VStack>

      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
        <Field label={localizedResource.initiative.label}>
          <HStack>
            <Input
              onValueChange={(value) =>
                onLocalizedResourceUpdate("initiative", { ...localizedResource.initiative, value })
              }
              placeholder={t("modifier.placeholder")}
              value={localizedResource.initiative.value}
            />
            <Input
              onValueChange={(passive) =>
                onLocalizedResourceUpdate("initiative", {
                  ...localizedResource.initiative,
                  passive,
                })
              }
              placeholder={t("passive.placeholder")}
              value={localizedResource.initiative.passive}
            />
          </HStack>
        </Field>
        <Field label={localizedResource.perception.label}>
          <HStack>
            <Input
              onValueChange={(value) =>
                onLocalizedResourceUpdate("perception", { ...localizedResource.perception, value })
              }
              placeholder={t("modifier.placeholder")}
              value={localizedResource.perception.value}
            />
            <Input
              onValueChange={(passive) =>
                onLocalizedResourceUpdate("perception", {
                  ...localizedResource.perception,
                  passive,
                })
              }
              placeholder={t("passive.placeholder")}
              value={localizedResource.perception.passive}
            />
          </HStack>
        </Field>
      </SimpleGrid>

      <Field label={localizedResource.speed.label}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("speed", { ...localizedResource.speed, value })
          }
          placeholder={t("speed.placeholder")}
          value={localizedResource.speed.value}
        />
      </Field>

      <SimpleGrid columns={1} gap={3}>
        <Field label={localizedResource.skills.label}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("skills", { ...localizedResource.skills, value })
            }
            placeholder={t("skills.placeholder")}
            value={localizedResource.skills.value}
          />
        </Field>
        <Field label={localizedResource.immunities.label}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("immunities", { ...localizedResource.immunities, value })
            }
            placeholder={t("immunities.placeholder")}
            value={localizedResource.immunities.value}
          />
        </Field>
        <Field label={localizedResource.resistances.label}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("resistances", { ...localizedResource.resistances, value })
            }
            placeholder={t("resistances.placeholder")}
            value={localizedResource.resistances.value}
          />
        </Field>
        <Field label={localizedResource.vulnerabilities.label}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("vulnerabilities", {
                ...localizedResource.vulnerabilities,
                value,
              })
            }
            placeholder={t("vulnerabilities.placeholder")}
            value={localizedResource.vulnerabilities.value}
          />
        </Field>
        <Field label={localizedResource.gear.label}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("gear", {
                ...localizedResource.gear,
                currency: "",
                entries: [],
                value,
              })
            }
            placeholder={t("gear.placeholder")}
            value={localizedResource.gear.value}
          />
        </Field>
        <Field label={localizedResource.languagesInfo.label}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("languagesInfo", {
                ...localizedResource.languagesInfo,
                value,
              })
            }
            placeholder={t("languages.placeholder")}
            value={localizedResource.languagesInfo.value}
          />
        </Field>
        <Field label={localizedResource.senses.label}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("senses", { ...localizedResource.senses, value })
            }
            placeholder={t("senses.placeholder")}
            value={localizedResource.senses.value}
          />
        </Field>
      </SimpleGrid>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "challenge_rating.placeholder": {
    en: "E.g. 1/4",
    it: "Es. 1/4",
  },
  "experience.placeholder": {
    en: "E.g. 200",
    it: "Es. 200",
  },
  "experience.with_lair": {
    en: "<1> (<2> in lair)",
    it: "<1> (<2> nella tana)",
  },
  "formula.placeholder": {
    en: "E.g. 4d8 + 4",
    it: "Es. 4d8 + 4",
  },
  "has_lair": {
    en: "Display lair XP",
    it: "Mostra PE della tana",
  },
  "lair_experience.label": {
    en: "XP in lair",
    it: "PE nella tana",
  },
  "lair_experience.placeholder": {
    en: "E.g. 250",
    it: "Es. 250",
  },
  "modifier": {
    en: "Mod.",
    it: "Mod.",
  },
  "modifier.placeholder": {
    en: "E.g. +3",
    it: "Es. +3",
  },
  "number.placeholder": {
    en: "E.g. 10",
    it: "Es. 10",
  },
  "passive.placeholder": {
    en: "E.g. 13",
    it: "Es. 13",
  },
  "proficiency_bonus.placeholder": {
    en: "E.g. +4",
    it: "Es. +4",
  },
  "save": {
    en: "Save",
    it: "Salv.",
  },
  "score": {
    en: "Score",
    it: "Valore",
  },
  "spell_level_legend": {
    en: "Spell level legend",
    it: "Legenda del livello dell'incantesimo",
  },
  "spell_level_legend.placeholder": {
    en: "E.g. X = spell level",
    it: "Es. X = livello dell'incantesimo",
  },
  "speed.placeholder": {
    en: "E.g. 30 ft., fly 60 ft.",
    it: "Es. 9 m, volo 18 m",
  },
  "summoned_from_spell": {
    en: "Summoned from a spell",
    it: "Evocato da un incantesimo",
  },
  "gear.placeholder": {
    en: "E.g. Shortsword, Leather Armor",
    it: "Es. Spada corta, Armatura di Cuoio",
  },
  "immunities.placeholder": {
    en: "E.g. Poison, Frightened",
    it: "Es. Veleno, Spaventato",
  },
  "languages.placeholder": {
    en: "E.g. Common, Elvish",
    it: "Es. Comune, Elfico",
  },
  "resistances.placeholder": {
    en: "E.g. Cold, Bludgeoning",
    it: "Es. Freddo, Contundenti",
  },
  "senses.placeholder": {
    en: "E.g. Darkvision 60 ft., Tremorsense 30 ft.",
    it: "Es. Scurovisione 18 m, Percezione Tellurica 9 m",
  },
  "skills.placeholder": {
    en: "E.g. Perception +5, Stealth +3",
    it: "Es. Percezione +5, Furtività +3",
  },
  "vulnerabilities.placeholder": {
    en: "E.g. Fire",
    it: "Es. Fuoco",
  },
};
