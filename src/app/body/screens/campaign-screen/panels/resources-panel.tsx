import { Box, Flex, HStack, VStack, Wrap } from "@chakra-ui/react";
import { Grid2X2Icon, ListIcon } from "lucide-react";
import { useMemo } from "react";
import z from "zod/v4";
import type { I18nLangContext } from "../../../../../i18n/i18n-lang";
import { useI18nLangContext } from "../../../../../i18n/i18n-lang-context";
import { createLocalStore } from "../../../../../store/local-store";
import BinaryButton, {
  type BinaryButtonProps,
} from "../../../../../ui/binary-button";
import DataTable, { type DataTableColumn } from "../../../../../ui/data-table";

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
    const resources = useResources(campaignId);

    if (!resources) return null;

    return (
      <Box bgColor="bg.subtle" w="full">
        <Wrap bgColor="bg.subtle" gap={4} justify="center" p={4} w="full">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </Wrap>
      </Box>
    );
  }

  //----------------------------------------------------------------------------
  // List Table
  //----------------------------------------------------------------------------

  function ListTable({ campaignId }: ResourcesPanelProps) {
    const { t } = useI18nLangContext(columnsI18nContext);
    const resources = useResources(campaignId);

    const columnTranslations = useMemo(
      () => columns.map((column) => ({ ...column, label: t(`${column.key}`) })),
      [t]
    );

    if (!resources) return null;

    return (
      <Box w="full">
        <DataTable
          columns={columnTranslations}
          expandedKey={descriptionKey}
          rows={resources}
        />
      </Box>
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
          h="4em"
          justify="space-between"
          overflow="auto"
          p={2}
          w="full"
        >
          <Filters />

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
