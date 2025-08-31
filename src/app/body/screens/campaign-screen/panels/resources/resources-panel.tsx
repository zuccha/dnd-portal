import {
  Flex,
  HStack,
  Menu,
  Portal,
  Separator,
  VStack,
} from "@chakra-ui/react";
import { EllipsisVerticalIcon, Grid2X2Icon, ListIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import z from "zod/v4";
import type { I18nLangContext } from "../../../../../../i18n/i18n-lang";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
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
import IconButton from "../../../../../../ui/icon-button";
import { downloadJson } from "../../../../../../utils/download";
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
  Filters: F,
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
  // Hooks
  //----------------------------------------------------------------------------

  const { useSelectionCount } = store;

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

  const resourceCounterI18nContext = {
    "count/*": {
      en: "<1> results",
      it: "<1> risultati",
    },
    "count/1": {
      en: "<1> result",
      it: "<1> risultato",
    },
  };

  function ResourcesCounter({ campaignId }: ResourcesPanelProps) {
    const { tpi } = useI18nLangContext(resourceCounterI18nContext);
    const translations = useFilteredResourceTranslations(campaignId);
    const count = translations?.length ?? 0;

    return (
      <Flex fontSize="sm" whiteSpace="nowrap">
        {tpi("count", count, `${count}`)}
      </Flex>
    );
  }

  //----------------------------------------------------------------------------
  // Actions Button
  //----------------------------------------------------------------------------

  const actionsButtonI18nContext = {
    copy: {
      en: "Copy selected",
      it: "Copia selezionati",
    },
    download: {
      en: "Download selected",
      it: "Scarica selezionati",
    },
  };

  function ActionsButton({ campaignId }: ResourcesPanelProps) {
    const { t } = useI18nLangContext(actionsButtonI18nContext);

    const totalSelectionCount = useSelectionCount();
    const translations = useFilteredResourceTranslations(campaignId);

    const selectionCount = useMemo(() => {
      if (!translations) return 0;
      return translations.filter(({ id }) => store.isSelected(id)).length;
    }, [translations, totalSelectionCount]); // eslint-disable-line react-hooks/exhaustive-deps

    const computeSelectedAsJson = useCallback(() => {
      const selected = translations!
        .filter(({ id }) => store.isSelected(id))
        .map(({ _raw, ...rest }) => rest);
      return JSON.stringify(selected, null, 2);
    }, [translations]);

    const copySelected = useCallback(async () => {
      if (!selectionCount) return;
      const json = computeSelectedAsJson();
      await navigator.clipboard.writeText(json);
      // TODO: Show toast.
    }, [computeSelectedAsJson, selectionCount]);

    const downloadSelected = useCallback(async () => {
      if (!selectionCount) return;
      const json = computeSelectedAsJson();
      downloadJson(json, `${store.id}.json`);
    }, [computeSelectedAsJson, selectionCount]);

    return (
      <Menu.Root>
        <Menu.Trigger asChild focusRing="outside" mr={2} rounded="full">
          <IconButton Icon={EllipsisVerticalIcon} size="sm" variant="ghost" />
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item
                disabled={!selectionCount}
                onClick={copySelected}
                value="copy"
              >
                {t("copy")}
              </Menu.Item>
              <Menu.Item
                disabled={!selectionCount}
                onClick={downloadSelected}
                value="download"
              >
                {t("download")}
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    );
  }

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
            <ActionsButton campaignId={campaignId} />
            <F />
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
