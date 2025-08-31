import { Flex, HStack, Separator, VStack } from "@chakra-ui/react";
import { Grid2X2Icon, ListIcon } from "lucide-react";
import z from "zod/v4";
import type { I18nLangContext } from "../../../../../../i18n/i18n-lang";
import type {
  Resource,
  ResourceFilters,
  ResourceStore,
  ResourceTranslation,
} from "../../../../../../resources/resource";
import { createLocalStore } from "../../../../../../store/local-store";
import BinaryButton, {
  type BinaryButtonProps,
} from "../../../../../../ui/binary-button";
import { createResourcesActions } from "./resources-actions";
import { createResourcesCounter } from "./resources-counter";
import { createResourceListCards } from "./resources-list-cards";
import {
  type ResourcesListTableColumn,
  createResourcesListTable,
} from "./resources-list-table";
import { createFilteredResourceTranslations } from "./use-filtered-resource-translations";

//------------------------------------------------------------------------------
// Create Resources Panel
//------------------------------------------------------------------------------

export type ResourcesPanelProps = {
  campaignId: string;
};

export function createResourcesPanel<
  R extends Resource,
  T extends ResourceTranslation<R>,
  F extends ResourceFilters
>({
  Filters,
  ResourceCard,
  listTableColumns,
  listTableColumnsI18nContext,
  store,
  useTranslateResource,
}: {
  Filters: React.FC;
  ResourceCard: React.FC<{ resource: T }>;
  listTableColumns: Omit<ResourcesListTableColumn<R, T>, "label">[];
  listTableColumnsI18nContext: I18nLangContext;
  listTableDescriptionKey: keyof T | undefined;
  store: ResourceStore<R, F>;
  useTranslateResource: () => (resource: R) => T;
}) {
  //----------------------------------------------------------------------------
  // View
  //----------------------------------------------------------------------------

  const useView = createLocalStore(
    "resources.view",
    "table",
    z.enum(["cards", "table"]).parse
  ).use;

  const viewOptions: BinaryButtonProps<"table", "cards">["options"] = [
    { Icon: ListIcon, value: "table" },
    { Icon: Grid2X2Icon, value: "cards" },
  ];

  //----------------------------------------------------------------------------
  // Use Filtered Resource Translations
  //----------------------------------------------------------------------------

  const useFilteredResourceTranslations = createFilteredResourceTranslations(
    store,
    useTranslateResource
  );

  //----------------------------------------------------------------------------
  // Resources List Cards
  //----------------------------------------------------------------------------

  const ResourcesListCards = createResourceListCards(
    useFilteredResourceTranslations,
    ResourceCard
  );

  //----------------------------------------------------------------------------
  // Resources List Table
  //----------------------------------------------------------------------------

  const ResourcesListTable = createResourcesListTable(
    store,
    useFilteredResourceTranslations,
    listTableColumns,
    listTableColumnsI18nContext
  );

  //----------------------------------------------------------------------------
  // Resources Counter
  //----------------------------------------------------------------------------

  const ResourcesCounter = createResourcesCounter(
    useFilteredResourceTranslations
  );

  //----------------------------------------------------------------------------
  // Resource Actions
  //----------------------------------------------------------------------------

  const ResourcesActions = createResourcesActions(
    store,
    useFilteredResourceTranslations
  );

  //----------------------------------------------------------------------------
  // Resources Panel
  //----------------------------------------------------------------------------

  return function ResourcesPanel({ campaignId }: ResourcesPanelProps) {
    const [view, setView] = useView();

    return (
      <VStack flex={1} gap={0} h="full" overflow="auto" w="full">
        <HStack
          borderBottomWidth={1}
          gap={4}
          h="4em"
          justify="space-between"
          overflow="auto"
          p={2}
          w="full"
        >
          <HStack>
            <ResourcesActions campaignId={campaignId} />
            <Filters />
            <Separator h="1.5em" orientation="vertical" />
            <ResourcesCounter campaignId={campaignId} />
          </HStack>

          <HStack>
            <BinaryButton
              onValueChange={setView}
              options={viewOptions}
              value={view}
            />
          </HStack>
        </HStack>

        <Flex flex={1} overflow="auto" w="full">
          {view === "table" && <ResourcesListTable campaignId={campaignId} />}
          {view === "cards" && <ResourcesListCards campaignId={campaignId} />}
        </Flex>
      </VStack>
    );
  };
}
