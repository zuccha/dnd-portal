import { GridItem, SimpleGrid, Span } from "@chakra-ui/react";
import { Fragment } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedCreature } from "~/models/resources/creatures/localized-creature";

//------------------------------------------------------------------------------
// Creature Detail Ability Score Table
//------------------------------------------------------------------------------

export default function CreatureDetailAbilityScoreTable({
  creature,
}: {
  creature: LocalizedCreature;
}) {
  const { t } = useI18nLangContext(i18nContext);
  const abilities: [string, string, string, string, string, "physical" | "mental"][] = [
    [
      "str",
      t("ability[str]"),
      creature.ability_str,
      creature.ability_str_mod,
      creature.ability_str_save,
      "physical",
    ],
    [
      "dex",
      t("ability[dex]"),
      creature.ability_dex,
      creature.ability_dex_mod,
      creature.ability_dex_save,
      "physical",
    ],
    [
      "con",
      t("ability[con]"),
      creature.ability_con,
      creature.ability_con_mod,
      creature.ability_con_save,
      "physical",
    ],
    [
      "int",
      t("ability[int]"),
      creature.ability_int,
      creature.ability_int_mod,
      creature.ability_int_save,
      "mental",
    ],
    [
      "wis",
      t("ability[wis]"),
      creature.ability_wis,
      creature.ability_wis_mod,
      creature.ability_wis_save,
      "mental",
    ],
    [
      "cha",
      t("ability[cha]"),
      creature.ability_cha,
      creature.ability_cha_mod,
      creature.ability_cha_save,
      "mental",
    ],
  ];

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} columnGap={6} rowGap={1}>
      {(["physical", "mental"] as const).map((category) => (
        <SimpleGrid key={category} rowGap={1} templateColumns="minmax(0, 1fr) auto 3.25rem 3.5rem">
          <GridItem
            colSpan={2}
            display={category === "mental" ? { base: "none", md: "block" } : "block"}
          />
          <Span
            color="fg.muted"
            display={category === "mental" ? { base: "none", md: "inline" } : "inline"}
            fontSize="xs"
            fontWeight="medium"
            textAlign="center"
          >
            {t("ability.mod")}
          </Span>
          <Span
            color="fg.muted"
            display={category === "mental" ? { base: "none", md: "inline" } : "inline"}
            fontSize="xs"
            fontWeight="medium"
            textAlign="center"
          >
            {t("ability.save")}
          </Span>
          {abilities
            .filter(([, , , , , abilityCategory]) => abilityCategory === category)
            .map(([key, label, score, modifier, save]) => (
              <Fragment key={key}>
                <Span bgColor={abilityRowColors[category].left} pl={2}>
                  {label}
                </Span>
                <Span bgColor={abilityRowColors[category].left} pr={2} textAlign="right">
                  {score}
                </Span>
                <Span bgColor={abilityRowColors[category].right} textAlign="center">
                  {modifier}
                </Span>
                <Span bgColor={abilityRowColors[category].right} textAlign="center">
                  {save}
                </Span>
              </Fragment>
            ))}
        </SimpleGrid>
      ))}
    </SimpleGrid>
  );
}

const abilityRowColors = {
  mental: { left: "#CBCBD1", right: "#C3ACBE" },
  physical: { left: "#EFE3E2", right: "#DAC1C4" },
};

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ability[cha]": { en: "Charisma", it: "Carisma" },
  "ability[con]": { en: "Constitution", it: "Costituzione" },
  "ability[dex]": { en: "Dexterity", it: "Destrezza" },
  "ability[int]": { en: "Intelligence", it: "Intelligenza" },
  "ability.mod": { en: "MOD", it: "MOD" },
  "ability.save": { en: "SAVE", it: "SALV" },
  "ability[str]": { en: "Strength", it: "Forza" },
  "ability[wis]": { en: "Wisdom", it: "Saggezza" },
};
