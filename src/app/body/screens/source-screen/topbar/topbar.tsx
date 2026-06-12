import { HStack, Span, type StackProps } from "@chakra-ui/react";
import { PanelLeftIcon, SlidersHorizontalIcon } from "lucide-react";
import { useRoute } from "~/navigation/navigation";
import { Route } from "~/navigation/routes";
import ThemeButton from "~/theme/theme-button";
import IconButton from "~/ui/icon-button";
import { usePrintModeActive } from "../panels/resources/resources-print-mode-state";
import { useRightPanelSetCollapsed } from "../right-panel-state";
import { useSidebarSetCollapsed } from "../sidebar/sidebar-state";
import I18nButton from "./i18n-button";
import UserButton from "./user-button";

//------------------------------------------------------------------------------
// Topbar
//------------------------------------------------------------------------------

export type TopbarProps = StackProps;

export default function Topbar() {
  const route = useRoute();
  const setSidebarCollapsed = useSidebarSetCollapsed();
  const setRightPanelCollapsed = useRightPanelSetCollapsed();
  const printModeActive = usePrintModeActive();
  const hasResourcesSidebar =
    route.startsWith(Route.Resources) && !printModeActive;

  return (
    <HStack
      borderBottomWidth={1}
      h={Topbar.height}
      justify="space-between"
      px={{ base: 3, md: 6 }}
      w="full"
    >
      <HStack
        flex={1}
        fontFamily="Title Wave"
        fontSize={{ base: "md", md: "2xl" }}
        fontWeight="bold"
        ml={{ base: 0, md: -3 }}
      >
        <IconButton
          Icon={PanelLeftIcon}
          flexShrink={0}
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          size="sm"
          variant="ghost"
        />
        <Span color="fg.error">D&D</Span> Portal
      </HStack>

      <HStack gap={{ base: 1, md: 2 }}>
        {hasResourcesSidebar && (
          <IconButton
            Icon={SlidersHorizontalIcon}
            onClick={() => setRightPanelCollapsed((prev) => !prev)}
            size="sm"
            variant="ghost"
          />
        )}
        {printModeActive && (
          <IconButton
            Icon={SlidersHorizontalIcon}
            onClick={() => setRightPanelCollapsed((prev) => !prev)}
            size="sm"
            variant="ghost"
          />
        )}
        <ThemeButton />
        <UserButton />
        <I18nButton />
      </HStack>
    </HStack>
  );
}

Topbar.height = "3em";
