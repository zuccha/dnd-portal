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
      <Text fontSize="sm" fontWeight="semibold" mb={2} pl={4}>
        {title}
      </Text>

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
