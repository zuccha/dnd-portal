import { Text, VStack } from "@chakra-ui/react";
import Button from "~/ui/button";

//------------------------------------------------------------------------------
// Sidebar Section
//------------------------------------------------------------------------------

export type SidebarSectionItem = {
  label: string;
  onClick: () => void;
  selected: boolean;
  value: string;
};

export type SidebarSectionProps = {
  items: SidebarSectionItem[];
  title: string;
};

export default function SidebarSection({ items, title }: SidebarSectionProps) {
  return (
    <VStack align="flex-start" gap={0.5} w="full">
      <VStack mb={2} px={4} w="full">
        <Text
          borderBottomWidth={1}
          fontSize="sm"
          fontWeight="semibold"
          w="full"
        >
          {title}
        </Text>
      </VStack>

      {items.map((item) => (
        <Button
          _hover={{ color: "fg" }}
          color={item.selected ? "fg" : "fg.muted"}
          justifyContent="flex-start"
          key={item.value}
          onClick={item.onClick}
          size="sm"
          variant={item.selected ? "subtle" : "ghost"}
          w="full"
        >
          {item.label}
        </Button>
      ))}
    </VStack>
  );
}
