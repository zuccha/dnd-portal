import { Box, Wrap } from "@chakra-ui/react";
import SpellCard from "./spell-card";
import useFilteredSpellTranslations from "./use-filtered-spell-translations";

//------------------------------------------------------------------------------
// Spells List Cards
//------------------------------------------------------------------------------

export type SpellsListCardsProps = {
  campaignId: string;
};

export default function SpellsListCards({ campaignId }: SpellsListCardsProps) {
  const spellTranslations = useFilteredSpellTranslations(campaignId);

  if (!spellTranslations) return null;

  return (
    <Box bgColor="bg.subtle" w="full">
      <Wrap bgColor="bg.subtle" gap={4} justify="center" p={4} w="full">
        {spellTranslations.map((spell) => (
          <SpellCard key={spell.id} spellTranslation={spell} />
        ))}
      </Wrap>
    </Box>
  );
}
