import { VStack } from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CircleSmallIcon,
} from "lucide-react";
import { useState } from "react";
import Button from "~/ui/button";
import Icon from "~/ui/icon";

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
  const [visible, setVisible] = useState(true);

  return (
    <VStack align="flex-start" gap={2} w="full">
      <Button
        alignItems="center"
        cursor="pointer"
        display="flex"
        fontSize="sm"
        fontWeight="semibold"
        gap={1}
        onClick={() => setVisible((prev) => !prev)}
        px={6}
        unstyled
        w="full"
      >
        {visible ?
          <Icon Icon={ChevronDownIcon} size="xs" />
        : <Icon Icon={ChevronRightIcon} size="xs" />}
        {title}
      </Button>

      {visible && (
        <VStack gap={0} px={2} w="full">
          {items.map((item) => (
            <Button
              _hover={{ bgColor: "bg.subtle", color: "fg" }}
              bgColor={item.selected ? "bg.muted" : "transparent"}
              color={item.selected ? "fg" : "fg.muted"}
              gap={0}
              justifyContent="flex-start"
              key={item.value}
              m={0}
              onClick={item.onClick}
              size="sm"
              w="full"
            >
              <Icon
                Icon={CircleSmallIcon}
                fill={item.selected ? "fg" : undefined}
                mr={1}
                size="xs"
              />
              {item.label}
            </Button>
          ))}
        </VStack>
      )}
    </VStack>
  );
}
