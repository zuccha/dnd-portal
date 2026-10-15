import { GridItem, SimpleGrid, Span } from "@chakra-ui/react";
import { Fragment } from "react";
import type { LocalizedCreature } from "~/models/resources/creatures/localized-creature";

//------------------------------------------------------------------------------
// Creature Detail Ability Score Table
//------------------------------------------------------------------------------

export default function CreatureDetailAbilityScoreTable({
  creature,
}: {
  creature: LocalizedCreature;
}) {
  const abilities = [
    { ...creature.abilityScores.strength, category: "physical", key: "strength" },
    { ...creature.abilityScores.dexterity, category: "physical", key: "dexterity" },
    { ...creature.abilityScores.constitution, category: "physical", key: "constitution" },
    { ...creature.abilityScores.intelligence, category: "mental", key: "intelligence" },
    { ...creature.abilityScores.wisdom, category: "mental", key: "wisdom" },
    { ...creature.abilityScores.charisma, category: "mental", key: "charisma" },
  ] as const;

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
            {creature.abilityScoreHeaders.modifier}
          </Span>
          <Span
            color="fg.muted"
            display={category === "mental" ? { base: "none", md: "inline" } : "inline"}
            fontSize="xs"
            fontWeight="medium"
            textAlign="center"
          >
            {creature.abilityScoreHeaders.save}
          </Span>
          {abilities
            .filter((ability) => ability.category === category)
            .map(({ key, label, modifier, save, score }) => (
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
