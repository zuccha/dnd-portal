import { HStack, Text, VStack } from "@chakra-ui/react";
import Button from "~/ui/button";

//------------------------------------------------------------------------------
// Search Result
//------------------------------------------------------------------------------

export default function SearchResult({
  index,
  kind,
  name,
  onClick,
  onMouseMove,
  selected,
  source,
}: {
  index: number;
  kind?: string;
  name: string;
  onClick: () => void;
  onMouseMove: () => void;
  selected: boolean;
  source?: string;
}) {
  return (
    <Button
      alignItems="center"
      aria-selected={selected}
      id={`resource-search-result-${index}`}
      h="4em"
      onClick={onClick}
      onMouseMove={onMouseMove}
      py={4}
      role="option"
      textAlign="left"
      variant={selected ? "subtle" : "ghost"}
      w="full"
    >
      <HStack align="center" justify="space-between" minW={0} w="full">
        <VStack align="stretch" gap={0} minW={0}>
          <Text
            overflow="hidden"
            textAlign="left"
            textOverflow="ellipsis"
            whiteSpace={{ base: "normal", sm: "nowrap" }}
          >
            {name}
          </Text>
          {source && (
            <Text color="fg.muted" fontSize="xs" lineHeight="shorter">
              {source}
            </Text>
          )}
        </VStack>
        {kind && (
          <Text color="fg.muted" flexShrink={0} fontSize="sm">
            {kind}
          </Text>
        )}
      </HStack>
    </Button>
  );
}
