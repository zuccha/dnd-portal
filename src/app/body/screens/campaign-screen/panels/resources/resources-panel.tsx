import { Flex, HStack, Separator, VStack } from "@chakra-ui/react";
import { Grid2X2Icon, ListIcon } from "lucide-react";
import z from "zod/v4";
import type { I18nLangContext } from "../../../../../../i18n/i18n-lang";
import type {
  LocalizedResource,
  Resource,
  ResourceFilters,
  ResourceStore,
  ResourceTranslation,
} from "../../../../../../resources/resource";
import { createLocalStore } from "../../../../../../store/local-store";
import BinaryButton, {
  type BinaryButtonProps,
} from "../../../../../../ui/binary-button";
import type { Form } from "../../../../../../utils/form";
import {
  type ResourceEditorContentProps,
  createResourceEditor,
} from "./resource-editor";
import { createResourcesActions } from "./resources-actions";
import { createResourcesCounter } from "./resources-counter";
import { createResourcesListCards } from "./resources-list-cards";
import {
  type ResourcesListTableColumn,
  createResourcesListTable,
} from "./resources-list-table";
import { createUseEditedResource } from "./use-edited-resource";
import { createUseFilteredLocalizedResources } from "./use-filtered-localized-resources";
import { createUseSelectedFilteredLocalizedResourcesCount } from "./use-selected-filtered-localized-resources-count";

//------------------------------------------------------------------------------
// Create Resources Panel
//------------------------------------------------------------------------------

export type ResourcesPanelProps = {
  campaignId: string;
};

export function createResourcesPanel<
  R extends Resource,
  T extends ResourceTranslation,
  F extends ResourceFilters,
  L extends LocalizedResource<R>,
  FF extends Record<string, unknown>
>({
  Filters,
  ResourceCard,
  ResourceEditorContent,
  listTableColumns,
  listTableColumnsI18nContext,
  listTableDescriptionKey,
  store,
  form,
  onSubmitEditorForm,
  useLocalizeResource,
}: {
  Filters: React.FC;
  ResourceCard: React.FC<{ resource: L }>;
  ResourceEditorContent: React.FC<ResourceEditorContentProps<R>>;
  listTableColumns: Omit<ResourcesListTableColumn<R, L>, "label">[];
  listTableColumnsI18nContext: I18nLangContext;
  listTableDescriptionKey: keyof L | undefined;
  store: ResourceStore<R, T, F>;
  form: Form<FF>;
  onSubmitEditorForm: (
    data: Partial<FF>,
    context: { id: string; lang: string }
  ) => Promise<string | undefined>;
  useLocalizeResource: () => (resource: R) => L;
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
  // Use Filtered Localized Resources
  //----------------------------------------------------------------------------

  const useFilteredLocalizedResources = createUseFilteredLocalizedResources(
    store,
    useLocalizeResource
  );

  //----------------------------------------------------------------------------
  // Use Filtered Localized Resources
  //----------------------------------------------------------------------------

  const useSelectedFilteredLocalizedResourcesCount =
    createUseSelectedFilteredLocalizedResourcesCount(
      store,
      useFilteredLocalizedResources
    );

  //----------------------------------------------------------------------------
  // Use Edited Resource
  //----------------------------------------------------------------------------

  const { useEditedResource, useSetEditedResource } =
    createUseEditedResource<R>();

  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(
    useEditedResource,
    useSetEditedResource,
    form,
    onSubmitEditorForm,
    ResourceEditorContent
  );

  //----------------------------------------------------------------------------
  // Resources List Cards
  //----------------------------------------------------------------------------

  const ResourcesListCards = createResourcesListCards(
    useFilteredLocalizedResources,
    useSetEditedResource,
    ResourceCard
  );

  //----------------------------------------------------------------------------
  // Resources List Table
  //----------------------------------------------------------------------------

  const ResourcesListTable = createResourcesListTable(
    store,
    useFilteredLocalizedResources,
    useSelectedFilteredLocalizedResourcesCount,
    useSetEditedResource,
    listTableColumns,
    listTableColumnsI18nContext,
    listTableDescriptionKey
  );

  //----------------------------------------------------------------------------
  // Resources Counter
  //----------------------------------------------------------------------------

  const ResourcesCounter = createResourcesCounter(
    useFilteredLocalizedResources
  );

  //----------------------------------------------------------------------------
  // Resource Actions
  //----------------------------------------------------------------------------

  const ResourcesActions = createResourcesActions(
    store,
    useFilteredLocalizedResources,
    useSelectedFilteredLocalizedResourcesCount
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

        <ResourceEditor campaignId={campaignId} />
      </VStack>
    );
  };
}
