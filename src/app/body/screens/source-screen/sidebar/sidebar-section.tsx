import { VStack } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon, CornerDownRightIcon } from "lucide-react";
import z from "zod";
import DotIcon from "~/icons/dot-icon";
import { createLocalStoreSet } from "~/store/set/local-store-set";
import Icon from "~/ui/icon";
import SectionButton from "./section-button";
import SidebarNavigationButton from "./sidebar-navigation-button";

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

export default function SidebarSection({ id, items, title }: SidebarSectionProps) {
  const [visible, setVisible] = useVisible(id, true);

  return (
    <VStack align="flex-start" gap={0} w="full">
      <SidebarNavigationButton
        active={items.some((item) => item.selected)}
        activeStyle="text"
        label={title}
        onClick={() => setVisible((prev) => !prev)}
        trailing={<Icon Icon={visible ? ChevronUpIcon : ChevronDownIcon} size="sm" />}
      />

      {visible && (
        <VStack gap={0} w="full">
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

const useVisible = createLocalStoreSet("sidebar.resources.visible", true, z.boolean().parse).use;
