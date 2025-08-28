import { Flex, HStack, VStack } from "@chakra-ui/react";
import { Grid2X2Icon, ListIcon } from "lucide-react";
import z from "zod/v4";
import { createLocalStore } from "../../../../../../store/local-store";
import BinaryButton, {
  type BinaryButtonProps,
} from "../../../../../../ui/binary-button";
import SpellsFilters from "./spells-filters";
import SpellsListCards from "./spells-list-cards";
import SpellsListTable from "./spells-list-table";

//------------------------------------------------------------------------------
// Spells Panel
//------------------------------------------------------------------------------

export type SpellsPanelProps = {
  campaignId: string;
};

export default function SpellsPanel({ campaignId }: SpellsPanelProps) {
  const [view, setView] = useView();

  return (
    <VStack flex={1} gap={0} h="full" overflow="auto" w="full">
      <HStack
        borderBottomWidth={1}
        h="full"
        justify="space-between"
        maxH="4em"
        overflow="auto"
        p={2}
        w="full"
      >
        <SpellsFilters />

        <BinaryButton
          onValueChange={setView}
          options={viewOptions}
          value={view}
        />
      </HStack>

      <Flex maxH="full" overflow="auto" w="full">
        {view === "table" && <SpellsListTable campaignId={campaignId} />}
        {view === "cards" && <SpellsListCards campaignId={campaignId} />}
      </Flex>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// View
//------------------------------------------------------------------------------

const useView = createLocalStore(
  "resources.spells.view",
  "table",
  z.enum(["cards", "table"]).parse
).use;

const viewOptions: BinaryButtonProps<"table", "cards">["options"] = [
  { Icon: ListIcon, value: "table" },
  { Icon: Grid2X2Icon, value: "cards" },
];
