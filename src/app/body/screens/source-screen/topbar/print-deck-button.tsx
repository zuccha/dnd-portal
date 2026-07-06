import { Box, Span } from "@chakra-ui/react";
import { PrinterIcon } from "lucide-react";
import { printDeck } from "~/models/print-deck/print-deck-store";
import { useRoute } from "~/navigation/navigation";
import { Route } from "~/navigation/routes";
import IconButton from "~/ui/icon-button";

//------------------------------------------------------------------------------
// Print Deck Button
//------------------------------------------------------------------------------

const { useEntries: usePrintDeckEntries } = printDeck;

export default function PrintDeckButton() {
  const route = useRoute();
  const printDeckEntries = usePrintDeckEntries();
  const printDeckCount = printDeckEntries.length;
  const printDeckCountLabel = printDeckCount > 99 ? "99+" : `${printDeckCount}`;

  return (
    <Box position="relative">
      <IconButton
        Icon={PrinterIcon}
        bgColor={Route.PrintDeck === route ? "bg.emphasized" : undefined}
        onClick={() => history.pushState({}, "", Route.PrintDeck)}
        size="sm"
        variant="ghost"
      />
      {!!printDeckCount && (
        <Span
          bg="fg.error"
          borderRadius="full"
          color="fg.inverted"
          fontSize="2xs"
          fontWeight="bold"
          lineHeight={1}
          minW={4}
          position="absolute"
          px={1}
          py={0.5}
          right={-0.5}
          textAlign="center"
          top={-0.5}
        >
          {printDeckCountLabel}
        </Span>
      )}
    </Box>
  );
}
