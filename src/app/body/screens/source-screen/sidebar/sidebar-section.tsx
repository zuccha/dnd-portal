import { VStack } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import z from "zod";
import { createLocalStoreSet } from "~/store/set/local-store-set";
import Icon from "~/ui/icon";
import SectionButton, { type SectionButtonProps } from "./section-button";
import SidebarNavigationButton from "./sidebar-navigation-button";

//------------------------------------------------------------------------------
// Sidebar Section
//------------------------------------------------------------------------------

export type SidebarSectionItem = {
  Icon: SectionButtonProps["Icon"];
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
  const [visible, setVisible] = useVisible(id, false);

  return (
    <VStack align="flex-start" gap={0} w="full">
      <SidebarNavigationButton
        active={items.some((item) => item.selected)}
        activeStyle="text"
        label={title}
        labelFontVariant="small-caps"
        onClick={() => setVisible((prev) => !prev)}
        trailing={<Icon Icon={visible ? ChevronUpIcon : ChevronDownIcon} size="sm" />}
      />

      {visible && (
        <VStack gap={0} w="full">
          {items.map((item) => (
            <SectionButton
              Icon={item.Icon}
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

const useVisible = createLocalStoreSet("sidebar.resources.visible", false, z.boolean().parse).use;
