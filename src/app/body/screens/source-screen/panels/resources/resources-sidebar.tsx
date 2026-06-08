import { VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import ResourcesSidebarToggleButton, {
  useResourcesSidebarCollapsed,
} from "./resources-sidebar-toggle-button";

export type ResourcesSidebarProps = {
  children: ReactNode;
};

export default function ResourcesSidebar({ children }: ResourcesSidebarProps) {
  const collapsed = useResourcesSidebarCollapsed();

  if (collapsed) {
    return (
      <VStack borderLeftWidth={1} h="full" px={2} py={4}>
        <ResourcesSidebarToggleButton />
      </VStack>
    );
  }

  return (
    <VStack
      align="flex-start"
      borderLeftWidth={1}
      gap={4}
      h="full"
      justify="flex-start"
      overflow="auto"
      px={6}
      py={4}
      w="15rem"
    >
      {children}
    </VStack>
  );
}
