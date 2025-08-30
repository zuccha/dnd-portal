import { Box, Flex, HStack, Separator, VStack, Wrap } from "@chakra-ui/react";
import { Grid2X2Icon, ListIcon, RatIcon } from "lucide-react";
import { useMemo } from "react";
import z from "zod/v4";
import type { I18nLangContext } from "../../../../../i18n/i18n-lang";
import { useI18nLangContext } from "../../../../../i18n/i18n-lang-context";
import { createLocalStore } from "../../../../../store/local-store";
import BinaryButton, {
  type BinaryButtonProps,
} from "../../../../../ui/binary-button";
import DataTable, { type DataTableColumn } from "../../../../../ui/data-table";
import EmptyState from "../../../../../ui/empty-state";

//------------------------------------------------------------------------------
// Create Resources Panel
//------------------------------------------------------------------------------

export type ResourcesPanelProps = {
  campaignId: string;
};

export function createResourcesPanel<Resource extends { id: string }>(
  useResources: (campaignId: string) => Resource[] | undefined,
  columns: Omit<DataTableColumn<Resource>, "label">[],
  columnsI18nContext: I18nLangContext,
  descriptionKey: keyof Resource | undefined,
  Filters: React.FC,
  ResourceCard: React.FC<{ resource: Resource }>
) {
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
  // List Cards
  //----------------------------------------------------------------------------

  function ListCards({ campaignId }: ResourcesPanelProps) {
    const { t } = useI18nLangContext(emptyListI18nContext);
    const resources = useResources(campaignId);

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
  // List Table
  //----------------------------------------------------------------------------

  function ListTable({ campaignId }: ResourcesPanelProps) {
    const { t } = useI18nLangContext(columnsI18nContext);
    const { t: tEmpty } = useI18nLangContext(emptyListI18nContext);
    const resources = useResources(campaignId);

    const columnTranslations = useMemo(
      () => columns.map((column) => ({ ...column, label: t(`${column.key}`) })),
      [t]
    );

    if (!resources) return null;

    return (
      <Box bgColor="bg.subtle" w="full">
        {resources.length ? (
          <DataTable
            columns={columnTranslations}
            expandedKey={descriptionKey}
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
    const resources = useResources(campaignId);
    const count = resources?.length ?? 0;

    return (
      <Flex fontSize="sm" whiteSpace="nowrap">
        {tpi("count", count, `${count}`)}
      </Flex>
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
            <Filters />
            <Separator h="1.5em" orientation="vertical" />
            <ResourcesCounter campaignId={campaignId} />
          </HStack>

          <BinaryButton
            onValueChange={setView}
            options={viewOptions}
            value={view}
          />
        </HStack>

        <Flex flex={1} overflow="auto" w="full">
          {view === "table" && <ListTable campaignId={campaignId} />}
          {view === "cards" && <ListCards campaignId={campaignId} />}
        </Flex>
      </VStack>
    );
  };
}
