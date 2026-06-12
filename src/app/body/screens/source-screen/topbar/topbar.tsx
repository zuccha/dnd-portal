import { HStack, Span, type StackProps } from "@chakra-ui/react";
import { PanelLeftIcon, SlidersHorizontalIcon } from "lucide-react";
import { useRoute } from "~/navigation/navigation";
import { Route } from "~/navigation/routes";
import ThemeButton from "~/theme/theme-button";
import IconButton from "~/ui/icon-button";
import { useResourcesSidebarSetCollapsed } from "../panels/resources/resources-sidebar-toggle-button";
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
  const setResourcesSidebarCollapsed = useResourcesSidebarSetCollapsed();
  const hasResourcesSidebar = route.startsWith(Route.Resources);

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
        ml={{ base: -3, md: -3 }}
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
        <I18nButton />
        {hasResourcesSidebar && (
          <IconButton
            Icon={SlidersHorizontalIcon}
            onClick={() => setResourcesSidebarCollapsed((prev) => !prev)}
            size="sm"
            variant="ghost"
          />
        )}
        <ThemeButton />
        <UserButton />
      </HStack>
    </HStack>
  );
}

Topbar.height = "3em";
