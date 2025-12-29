import {
  Box,
  Flex,
  HStack,
  Span,
  type StackProps,
  VStack,
  createListCollection,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import Button from "~/ui/button";
import Field from "~/ui/field";
import Select from "~/ui/select";
import type { ResourcesAlbumCardProps } from "./resources-album-card";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resources Print Mode Extra
//------------------------------------------------------------------------------

export type ResourcesPrintModeExtra = {
  AlbumCard: React.FC<ResourcesAlbumCardProps> & {
    height: number;
    width: number;
  };
  pageCount: number;
};

//------------------------------------------------------------------------------
// Create Resources Print Mode
//------------------------------------------------------------------------------

export type ResourcesPrintModeProps = StackProps & {
  campaignId: string;
};

export function createResourcesPrintMode<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  context: ResourcesContext<R>,
  { AlbumCard, pageCount }: ResourcesPrintModeExtra,
) {
  return function ResourcesPrintMode({
    campaignId,
    ...rest
  }: ResourcesPrintModeProps) {
    const { t } = useI18nLangContext(i18nContext);
    const filteredResourceIds = store.useFilteredResourceIds(campaignId);

    const [paperType, setPaperType] = useState<PaperType>("a4");
    const paperSize = paperSizes[paperType];

    const columns = Math.floor(paperSize.width / AlbumCard.width);
    const rows = Math.floor(paperSize.height / AlbumCard.height);
    const cardsPerPaper = columns * rows;

    const paperPadding = {
      px: `${(paperSize.width - columns * AlbumCard.width) / 2}in`,
      py: `${(paperSize.height - rows * AlbumCard.height) / 2}in`,
    };

    const paperTypeOptions = useMemo(() => {
      return createListCollection({
        items: paperTypes.map((paperType) => ({
          label: t(`paper_type[${paperType}]`),
          value: paperType,
        })),
      });
    }, [t]);

    const papers = useMemo(() => {
      const papers: { pageNumber: number; resourceId: string }[][] = [];
      let paper: { pageNumber: number; resourceId: string }[] = [];
      let paperResourceCount = 0;

      for (const resourceId of filteredResourceIds) {
        for (let pageNumber = 0; pageNumber < pageCount; ++pageNumber) {
          paper.push({ pageNumber, resourceId });
          paperResourceCount++;
          if (paperResourceCount >= cardsPerPaper) {
            papers.push(paper);
            paper = [];
            paperResourceCount = 0;
          }
        }
      }

      if (paperResourceCount > 0) {
        papers.push(paper);
        paper = [];
        paperResourceCount = 0;
      }

      return papers;
    }, [cardsPerPaper, filteredResourceIds]);

    return (
      <HStack gap={0} overflow="hidden" {...rest}>
        <VStack bg="bg.subtle" flex={1} h="full" overflow="auto" p={4}>
          <VStack
            align="center"
            className="printable"
            gap={0}
            m="auto"
            pointerEvents="none"
            separator={
              <Box
                borderColor="black"
                borderStyle="dashed"
                borderTopWidth={2}
                className="not-printable"
                w={`${paperSize.width}in`}
              />
            }
          >
            {papers.map((paper, paperNumber) => (
              <Flex
                alignContent="flex-start"
                bgColor="white"
                height={`${paperSize.height}in`}
                justify="flex-start"
                key={paperNumber}
                width={`${paperSize.width}in`}
                wrap="wrap"
                {...paperPadding}
              >
                {paper.map(({ pageNumber, resourceId }) => (
                  <AlbumCard
                    borderRadius={0}
                    campaignId={campaignId}
                    initialPageNumber={pageNumber}
                    key={`${resourceId}-${pageNumber}`}
                    printMode
                    resourceId={resourceId}
                    shadow="none"
                  />
                ))}
              </Flex>
            ))}
          </VStack>
        </VStack>

        <VStack borderLeftWidth={1} gap={4} h="full" px={6} py={4} w="15em">
          <HStack justify="space-between" w="full">
            <Span fontSize="sm" fontWeight="semibold">
              {t("settings.title")}
            </Span>
          </HStack>

          <VStack w="full">
            <Field label={t("paper_type.label")}>
              <Select
                onValueChange={setPaperType}
                options={paperTypeOptions}
                size="xs"
                value={paperType}
              />
            </Field>
          </VStack>

          <HStack justify="flex-end" w="full">
            <Button
              onClick={() => context.setPrintMode(false)}
              size="xs"
              variant="outline"
            >
              {t("close")}
            </Button>

            <Button onClick={() => window.print()} size="xs">
              {t("print")}
            </Button>
          </HStack>
        </VStack>
      </HStack>
    );
  };
}

//------------------------------------------------------------------------------
// Paper Sizes
//------------------------------------------------------------------------------

const paperTypeSchema = z.enum([
  "a3",
  "a4",
  "a5",
  "letter",
  "legal",
  "tabloid",
]);

type PaperType = z.infer<typeof paperTypeSchema>;

const paperTypes = paperTypeSchema.options;

const paperSizes: Record<PaperType, { height: number; width: number }> = {
  a3: { height: 16.54, width: 11.69 },
  a4: { height: 11.69, width: 8.27 },
  a5: { height: 8.27, width: 5.83 },
  legal: { height: 14, width: 8.5 },
  letter: { height: 11, width: 8.5 },
  tabloid: { height: 17, width: 11 },
};

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "close": {
    en: "Close",
    it: "Chiudi",
  },
  "paper_type.label": {
    en: "Paper Size",
    it: "Dimensione Pagina",
  },
  "paper_type[a3]": {
    en: "A3",
    it: "A3",
  },
  "paper_type[a4]": {
    en: "A4",
    it: "A4",
  },
  "paper_type[a5]": {
    en: "A5",
    it: "A5",
  },
  "paper_type[legal]": {
    en: "Legal",
    it: "Legale",
  },
  "paper_type[letter]": {
    en: "Letter",
    it: "Lettera",
  },
  "paper_type[tabloid]": {
    en: "Tabloid",
    it: "Tabloid",
  },
  "print": {
    en: "Print",
    it: "Stampa",
  },
  "settings.title": {
    en: "Print Settings",
    it: "Impostazioni di Stampa",
  },
};
