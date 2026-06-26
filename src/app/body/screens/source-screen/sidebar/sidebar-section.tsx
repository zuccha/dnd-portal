import { VStack } from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CornerDownRightIcon,
} from "lucide-react";
import z from "zod";
import SectionButton from "~/app/body/screens/source-screen/sidebar/section-button";
import DotIcon from "~/icons/dot-icon";
import { createLocalStoreSet } from "~/store/set/local-store-set";
import Button from "~/ui/button";
import Icon from "~/ui/icon";
import SectionHeading from "~/ui/section-heading";

//------------------------------------------------------------------------------
// Sidebar Section
//------------------------------------------------------------------------------

export type SidebarSectionItem = {
  label: string;
  modifier?: boolean;
  onClick: () => void;
  selected: boolean;
  value: string;
};

export type SidebarSectionProps = {
  id: string;
  items: SidebarSectionItem[];
  title: string;
};

export default function SidebarSection({
  id,
  items,
  title,
}: SidebarSectionProps) {
  const [visible, setVisible] = useVisible(id, true);

  return (
    <VStack align="flex-start" gap={2} w="full">
      <Button
        alignItems="center"
        cursor="pointer"
        display="flex"
        gap={1}
        h={8}
        onClick={() => setVisible((prev) => !prev)}
        px={6}
        textAlign="left"
        unstyled
        w="full"
      >
        <SectionHeading flex={1}>{title}</SectionHeading>
        {visible ?
          <Icon Icon={ChevronUpIcon} size="sm" />
        : <Icon Icon={ChevronDownIcon} size="sm" />}
      </Button>

      {visible && (
        <VStack gap={0} px={2} w="full">
          {items.map((item) => (
            <SectionButton
              Icon={item.modifier ? CornerDownRightIcon : DotIcon}
              active={item.selected}
              indent={item.modifier ? 4 : 0}
              key={item.value}
              label={item.label}
              onClick={item.onClick}
            />
          ))}
        </VStack>
      )}
    </VStack>
  );
}

const useVisible = createLocalStoreSet(
  "sidebar.resources.visible",
  true,
  z.boolean().parse,
).use;
