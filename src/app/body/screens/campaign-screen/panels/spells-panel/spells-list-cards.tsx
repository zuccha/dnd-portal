import { Box, Wrap } from "@chakra-ui/react";
import SpellCard from "./spell-card";
import useFilteredSpells from "./use-filtered-spells";

//------------------------------------------------------------------------------
// Spells List Cards
//------------------------------------------------------------------------------

export type SpellsListCardsProps = {
  campaignId: string;
};

export default function SpellsListCards({ campaignId }: SpellsListCardsProps) {
  const spells = useFilteredSpells(campaignId);

  if (!spells) return null;

  return (
    <Box bgColor="bg.subtle" w="full">
      <Wrap bgColor="bg.subtle" gap={4} justify="center" p={4} w="full">
        {spells.map((spell) => (
          <SpellCard spellTranslation={spell} />
        ))}
      </Wrap>
    </Box>
  );
}
