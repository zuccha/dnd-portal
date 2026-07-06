import { Box, HStack } from "@chakra-ui/react";
import { usePrintDeckMode } from "./print-deck";
import PrintDeckContentList from "./print-deck-content-list";
import PrintDeckContentPreview from "./print-deck-content-preview";
import PrintDeckSidebar from "./print-deck-sidebar";

//------------------------------------------------------------------------------
// Print Deck Panel
//------------------------------------------------------------------------------

export default function PrintDeckPanel() {
  const [mode] = usePrintDeckMode();

  return (
    <HStack
      align="stretch"
      className="print-mode"
      flex={1}
      gap={0}
      h="full"
      overflow="hidden"
    >
      <Box flex={1} h="full" overflow="hidden" position="relative">
        <PrintDeckContentPreview />
        <Box
          bgColor="bg.subtle"
          bottom={0}
          hidden={mode !== "list"}
          left={0}
          position="absolute"
          right={0}
          top={0}
          zIndex={1}
        >
          <PrintDeckContentList />
        </Box>
      </Box>

      <PrintDeckSidebar />
    </HStack>
  );
}
