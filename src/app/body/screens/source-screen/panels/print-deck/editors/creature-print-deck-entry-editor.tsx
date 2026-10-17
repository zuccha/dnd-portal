import { HStack, SimpleGrid, Span, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedCreature } from "~/models/resources/creatures/localized-creature";
import type { CreatureAbility } from "~/models/types/creature-ability";
import Field from "~/ui/field";
import Input from "~/ui/input";
import Switch from "~/ui/switch";
import ResourcePrintDeckEntryEditor from "./resource-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Creature Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function CreaturePrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedCreature>) {
  const { t, ti } = useI18nLangContext(i18nContext);
  const summonedFromSpell = localizedResource.summoned_from_spell;

  const updateExperience = (update: Partial<typeof localizedResource.experience>) => {
    const experience = { ...localizedResource.experience, ...update };
    const value_with_lair =
      experience.lair.value && experience.value !== experience.lair.value
        ? ti("experience.with_lair", experience.value, experience.lair.value)
        : experience.value;
    onLocalizedResourceUpdate("experience", { ...experience, value_with_lair });
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
    <ResourcePrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <VStack align="stretch" gap={3}>
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
          <Field label={t("armor_class")}>
            <Input
              onValueChange={(value) =>
                onLocalizedResourceUpdate("armor_class", {
                  ...localizedResource.armor_class,
                  value,
                })
              }
              placeholder={t("number.placeholder")}
              value={localizedResource.armor_class.value}
            />
          </Field>
          <Field label={t("hit_points")}>
            <HStack>
              <Input
                onValueChange={(value) =>
                  onLocalizedResourceUpdate("hit_points", {
                    ...localizedResource.hit_points,
                    value,
                  })
                }
                placeholder={t("number.placeholder")}
                value={localizedResource.hit_points.value}
              />
              <Input
                disabled={summonedFromSpell}
                onValueChange={(formula) =>
                  onLocalizedResourceUpdate("hit_points", {
                    ...localizedResource.hit_points,
                    formula,
                  })
                }
                placeholder={t("formula.placeholder")}
                value={localizedResource.hit_points.formula}
              />
            </HStack>
          </Field>
          <Field label={t("proficiency_bonus")}>
            <Input
              disabled={summonedFromSpell}
              onValueChange={(value) =>
                onLocalizedResourceUpdate("proficiency_bonus", {
                  ...localizedResource.proficiency_bonus,
                  value,
                })
              }
              placeholder={t("proficiency_bonus.placeholder")}
              value={localizedResource.proficiency_bonus.value}
            />
          </Field>
          <Field label={t("challenge_rating")}>
            <Input
              disabled={summonedFromSpell}
              onValueChange={(value) =>
                onLocalizedResourceUpdate("challenge_rating", {
                  ...localizedResource.challenge_rating,
                  value,
                })
              }
              placeholder={t("challenge_rating.placeholder")}
              value={localizedResource.challenge_rating.value}
            />
          </Field>
          <HStack align="flex-start" gridColumn={{ base: "auto", sm: "span 2" }}>
            <HStack align="flex-end" flex={1}>
              <Field label={t("experience")}>
                <Input
                  disabled={summonedFromSpell}
                  onValueChange={(value) => updateExperience({ value })}
                  placeholder={t("experience.placeholder")}
                  value={localizedResource.experience.value}
                />
              </Field>
              <Field label={t("lair_experience.label")}>
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
                  disabled={!localizedResource.summoned_from_spell}
                  onValueChange={(value) => onLocalizedResourceUpdate("spell_level_legend", value)}
                  placeholder={t("spell_level_legend.placeholder")}
                  value={localizedResource.spell_level_legend}
                />
              </Field>
              <Switch
                label={t("summoned_from_spell")}
                onValueChange={(value) => onLocalizedResourceUpdate("summoned_from_spell", value)}
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
            const score = localizedResource.ability_scores[ability];

            return (
              <SimpleGrid columns={4} gap={2} key={ability}>
                <Span alignSelf="center">{t(`ability.${ability}`)}</Span>
                <Input
                  aria-label={`${score.label} ${t("score")}`}
                  onValueChange={(value) =>
                    onLocalizedResourceUpdate("ability_scores", {
                      ...localizedResource.ability_scores,
                      [ability]: { ...score, score: value },
                    })
                  }
                  placeholder={t("number.placeholder")}
                  value={score.score}
                />
                <Input
                  aria-label={`${score.label} ${t("modifier")}`}
                  onValueChange={(value) =>
                    onLocalizedResourceUpdate("ability_scores", {
                      ...localizedResource.ability_scores,
                      [ability]: { ...score, modifier: value },
                    })
                  }
                  placeholder={t("modifier.placeholder")}
                  value={score.modifier}
                />
                <Input
                  aria-label={`${score.label} ${t("save")}`}
                  onValueChange={(value) =>
                    onLocalizedResourceUpdate("ability_scores", {
                      ...localizedResource.ability_scores,
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
          <Field label={t("initiative")}>
            <HStack>
              <Input
                onValueChange={(value) =>
                  onLocalizedResourceUpdate("initiative", {
                    ...localizedResource.initiative,
                    value,
                  })
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
          <Field label={t("perception")}>
            <HStack>
              <Input
                onValueChange={(value) =>
                  onLocalizedResourceUpdate("perception", {
                    ...localizedResource.perception,
                    value,
                  })
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

        <Field label={t("speed")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("speed", { ...localizedResource.speed, value })
            }
            placeholder={t("speed.placeholder")}
            value={localizedResource.speed.value}
          />
        </Field>

        <SimpleGrid columns={1} gap={3}>
          <Field label={t("skills")}>
            <Input
              onValueChange={(value) =>
                onLocalizedResourceUpdate("skills", { ...localizedResource.skills, value })
              }
              placeholder={t("skills.placeholder")}
              value={localizedResource.skills.value}
            />
          </Field>
          <Field label={t("immunities")}>
            <Input
              onValueChange={(value) =>
                onLocalizedResourceUpdate("immunities", { ...localizedResource.immunities, value })
              }
              placeholder={t("immunities.placeholder")}
              value={localizedResource.immunities.value}
            />
          </Field>
          <Field label={t("resistances")}>
            <Input
              onValueChange={(value) =>
                onLocalizedResourceUpdate("resistances", {
                  ...localizedResource.resistances,
                  value,
                })
              }
              placeholder={t("resistances.placeholder")}
              value={localizedResource.resistances.value}
            />
          </Field>
          <Field label={t("vulnerabilities")}>
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
          <Field label={t("gear")}>
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
          <Field label={t("languages")}>
            <Input
              onValueChange={(value) =>
                onLocalizedResourceUpdate("languages_info", {
                  ...localizedResource.languages_info,
                  value,
                })
              }
              placeholder={t("languages.placeholder")}
              value={localizedResource.languages_info.value}
            />
          </Field>
          <Field label={t("senses")}>
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
    </ResourcePrintDeckEntryEditor>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ability.charisma": {
    en: "Charisma",
    it: "Carisma",
  },
  "ability.constitution": {
    en: "Constitution",
    it: "Costituzione",
  },
  "ability.dexterity": {
    en: "Dexterity",
    it: "Destrezza",
  },
  "ability.intelligence": {
    en: "Intelligence",
    it: "Intelligenza",
  },
  "ability.strength": {
    en: "Strength",
    it: "Forza",
  },
  "ability.wisdom": {
    en: "Wisdom",
    it: "Saggezza",
  },
  "armor_class": {
    en: "Armor Class",
    it: "Classe Armatura",
  },
  "challenge_rating.placeholder": {
    en: "E.g. 1/4",
    it: "Es. 1/4",
  },
  "challenge_rating": {
    en: "Challenge Rating",
    it: "Grado di Sfida",
  },
  "experience": {
    en: "Experience Points",
    it: "Punti Esperienza",
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
  "gear": {
    en: "Equipment",
    it: "Equipaggiamento",
  },
  "hit_points": {
    en: "Hit Points",
    it: "Punti Ferita",
  },
  "has_lair": {
    en: "Display lair XP",
    it: "Mostra PE della tana",
  },
  "immunities": {
    en: "Immunities",
    it: "Immunità",
  },
  "initiative": {
    en: "Initiative",
    it: "Iniziativa",
  },
  "languages": {
    en: "Languages",
    it: "Lingue",
  },
  "lair_experience.label": {
    en: "XP in Lair",
    it: "PE nella Tana",
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
  "perception": {
    en: "Perception",
    it: "Percezione",
  },
  "passive.placeholder": {
    en: "E.g. 13",
    it: "Es. 13",
  },
  "proficiency_bonus": {
    en: "Proficiency Bonus",
    it: "Bonus di Competenza",
  },
  "proficiency_bonus.placeholder": {
    en: "E.g. +4",
    it: "Es. +4",
  },
  "resistances": {
    en: "Resistances",
    it: "Resistenze",
  },
  "save": {
    en: "Save",
    it: "Salv.",
  },
  "score": {
    en: "Score",
    it: "Valore",
  },
  "senses": {
    en: "Senses",
    it: "Sensi",
  },
  "skills": {
    en: "Skills",
    it: "Abilità",
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
  "speed": {
    en: "Speed",
    it: "Velocità",
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
  "vulnerabilities": {
    en: "Vulnerabilities",
    it: "Vulnerabilità",
  },
};
