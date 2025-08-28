import { Flex, HStack, VStack } from "@chakra-ui/react";
import SpellsFilters from "./spells-filters";
import SpellsListTable from "./spells-list-table";

//------------------------------------------------------------------------------
// Spells Panel
//------------------------------------------------------------------------------

export type SpellsPanelProps = {
  campaignId: string;
};

export default function SpellsPanel({ campaignId }: SpellsPanelProps) {
  return (
    <VStack flex={1} gap={0} h="full" overflow="auto" w="full">
      <HStack
        borderBottomWidth={1}
        h="full"
        maxH="4em"
        overflow="auto"
        p={2}
        w="full"
      >
        <SpellsFilters />
      </HStack>

      <Flex maxH="full" overflow="auto" w="full">
        <SpellsListTable campaignId={campaignId} />
      </Flex>
    </VStack>
  );
}
