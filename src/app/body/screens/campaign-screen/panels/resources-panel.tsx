import {
  Box,
  Flex,
  HStack,
  Menu,
  Portal,
  Separator,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import {
  EllipsisVerticalIcon,
  Grid2X2Icon,
  ListIcon,
  RatIcon,
} from "lucide-react";
import { type ReactNode, useCallback, useMemo } from "react";
import z from "zod/v4";
import { createUseShared } from "../../../../../hooks/use-shared";
import type { I18nLangContext } from "../../../../../i18n/i18n-lang";
import { useI18nLangContext } from "../../../../../i18n/i18n-lang-context";
import type { I18nString } from "../../../../../i18n/i18n-string";
import type { ResourceStore } from "../../../../../resources/resource";
import { createLocalStore } from "../../../../../store/local-store";
import BinaryButton, {
  type BinaryButtonProps,
} from "../../../../../ui/binary-button";
import EmptyState from "../../../../../ui/empty-state";
import IconButton from "../../../../../ui/icon-button";
import { downloadJson } from "../../../../../utils/download";
import ResourcesTable, { type ResourcesTableColumn } from "./resources-table";

//------------------------------------------------------------------------------
// Create Resources Panel
//------------------------------------------------------------------------------

export type ResourcesPanelProps = {
  campaignId: string;
};

export function createResourcesPanel<
  Resource extends { id: string; name: I18nString },
  ResourceTranslation extends { _raw: Resource; id: string },
  Filters extends { order_by: string; order_dir: "asc" | "desc" }
>({
  Filters,
  ResourceCard,
  listTableColumns,
  listTableColumnsI18nContext,
  listTableDescriptionKey,
  store,
  useTranslateResource,
}: {
  Filters: React.FC;
  ResourceCard: React.FC<{ resource: ResourceTranslation }>;
  listTableColumns: Omit<ResourcesTableColumn<ResourceTranslation>, "label">[];
  listTableColumnsI18nContext: I18nLangContext;
  listTableDescriptionKey: keyof ResourceTranslation | undefined;
  store: ResourceStore<Resource, Filters>;
  useTranslateResource: () => (resource: Resource) => ResourceTranslation;
}) {
  //----------------------------------------------------------------------------
  // Hooks
  //----------------------------------------------------------------------------

  const { useFromCampaign, useNameFilter, useSelectionCount, useIsSelected } =
    store;

  //----------------------------------------------------------------------------
  // Empty List I18n Context
  //----------------------------------------------------------------------------

  const emptyListI18nContext = {
    title: {
      en: "No items found",
      it: "Nessun elemento trovato",
    },

    subtitle: {
      en: "Clear your filters and try again",
      it: "Resetta i filtri e riprova",
    },
  };

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

  const useSharedTranslations = createUseShared<
    ResourceTranslation[] | undefined
  >(undefined, [undefined, undefined]);

  const useSharedFilteredTranslations = createUseShared<
    ResourceTranslation[] | undefined
  >(undefined, [undefined, undefined]);

  function useFilteredResourceTranslations(campaignId: string) {
    const { data } = useFromCampaign(campaignId);
    const translate = useTranslateResource();
    const [nameFilter] = useNameFilter();

    const translations = useSharedTranslations(
      () => (data ? data.map(translate) : undefined),
      [data, translate]
    );

    return useSharedFilteredTranslations(() => {
      const trimmedNameFilter = nameFilter.trim().toLowerCase();
      return translations
        ? translations.filter((translation) => {
            const names = Object.values(translation._raw.name);
            return names.some((name) =>
              name?.trim().toLowerCase().includes(trimmedNameFilter)
            );
          })
        : undefined;
    }, [nameFilter, translations]);
  }

  //----------------------------------------------------------------------------
  // List Cards
  //----------------------------------------------------------------------------

  function ListCards({ campaignId }: ResourcesPanelProps) {
    const { t } = useI18nLangContext(emptyListI18nContext);
    const resources = useFilteredResourceTranslations(campaignId);

    if (!resources) return null;

    return (
      <Box bgColor="bg.subtle" w="full">
        <Wrap bgColor="bg.subtle" gap={4} justify="center" p={4} w="full">
          {resources.length ? (
            resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))
          ) : (
            <EmptyState
              Icon={RatIcon}
              mt="10%"
              subtitle={t("subtitle")}
              title={t("title")}
            />
          )}
        </Wrap>
      </Box>
    );
  }

  //----------------------------------------------------------------------------
  // List Table Header Wrapper
  //----------------------------------------------------------------------------

  function ListTableHeaderWrapper({
    children,
    resources,
  }: {
    children: (
      selected: boolean | "-",
      toggleSelected: () => void
    ) => ReactNode;
    resources: ResourceTranslation[];
  }) {
    const totalCount = useSelectionCount();

    const selected = useMemo(() => {
      if (!resources) return false;
      const count = resources.filter(({ id }) => store.isSelected(id)).length;
      return count === resources.length ? true : count > 0 ? "-" : false;
    }, [resources, totalCount]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleSelected = useCallback(() => {
      if (selected === true) resources?.forEach(({ id }) => store.deselect(id));
      else resources?.forEach(({ id }) => store.select(id));
    }, [resources, selected, totalCount]); // eslint-disable-line react-hooks/exhaustive-deps

    return children(selected, toggleSelected);
  }

  //----------------------------------------------------------------------------
  // List Table Row Wrapper
  //----------------------------------------------------------------------------

  function ListTableRowWrapper({
    children,
    id,
  }: {
    children: (selected: boolean, toggleSelected: () => void) => ReactNode;
    id: string;
  }) {
    const [selected, { toggle }] = useIsSelected(id);
    return children(selected, toggle);
  }

  //----------------------------------------------------------------------------
  // List Table
  //----------------------------------------------------------------------------

  function ListTable({ campaignId }: ResourcesPanelProps) {
    const { t } = useI18nLangContext(listTableColumnsI18nContext);
    const { t: tEmpty } = useI18nLangContext(emptyListI18nContext);
    const resources = useFilteredResourceTranslations(campaignId);

    const columnTranslations = useMemo(
      () =>
        listTableColumns.map((column) => ({
          ...column,
          label: t(`${column.key}`),
        })),
      [t]
    );

    if (!resources) return null;

    return (
      <Box bgColor="bg.subtle" w="full">
        {resources.length ? (
          <ResourcesTable
            HeaderWrapper={ListTableHeaderWrapper}
            RowWrapper={ListTableRowWrapper}
            columns={columnTranslations}
            expandedKey={listTableDescriptionKey}
            rows={resources}
          />
        ) : (
          <EmptyState
            Icon={RatIcon}
            mt="10%"
            subtitle={tEmpty("subtitle")}
            title={tEmpty("title")}
          />
        )}
      </Box>
    );
  }

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
    const resources = useFilteredResourceTranslations(campaignId);
    const count = resources?.length ?? 0;

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
    const resources = useFilteredResourceTranslations(campaignId);

    const selectionCount = useMemo(() => {
      if (!resources) return 0;
      return resources.filter(({ id }) => store.isSelected(id)).length;
    }, [resources, totalSelectionCount]); // eslint-disable-line react-hooks/exhaustive-deps

    const computeSelectedAsJson = useCallback(() => {
      const selected = resources!
        .filter(({ id }) => store.isSelected(id))
        .map(({ _raw, ...rest }) => rest);
      return JSON.stringify(selected, null, 2);
    }, [resources]);

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
        <Menu.Trigger focusRing="outside" mr={2} rounded="full">
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
          {view === "table" && <ListTable campaignId={campaignId} />}
          {view === "cards" && <ListCards campaignId={campaignId} />}
        </Flex>
      </VStack>
    );
  };
}
