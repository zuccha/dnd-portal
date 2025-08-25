import { Center } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Page Spells
//------------------------------------------------------------------------------

export type PageSpellsProps = {
  campaignId: string;
};

export default function PageSpells(_props: PageSpellsProps) {
  return (
    <Center h="full" w="full">
      Spells
    </Center>
  );
}
