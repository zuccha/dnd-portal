import { VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useRightPanelCollapsed } from "../../right-panel-state";

export type ResourcesSidebarProps = {
  children: ReactNode;
};

export default function ResourcesSidebar({ children }: ResourcesSidebarProps) {
  const collapsed = useRightPanelCollapsed();

  return (
    <VStack
      align="flex-start"
      bg="bg"
      borderLeftWidth={1}
      boxShadow={{ base: "lg", md: "none" }}
      display={collapsed ? "none" : "flex"}
      gap={4}
      h="full"
      justify="flex-start"
      overflow="auto"
      position={{ base: "absolute", md: "static" }}
      px={6}
      py={4}
      right={0}
      top={0}
      w="15rem"
      zIndex={{ base: "modal", md: "auto" }}
    >
      {children}
    </VStack>
  );
}
