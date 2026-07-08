import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { type ComponentType, useCallback, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import IconButton from "~/ui/icon-button";
import type { Palette } from "~/utils/palette";
import type { ResourcePokerCardProps } from "./resource-poker-card";

//------------------------------------------------------------------------------
// Resource Card Preview Props
//------------------------------------------------------------------------------

export type ResourceCardPreviewProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  Card: ComponentType<
    Omit<
      ResourcePokerCardProps<R, L>,
      "afterDetails" | "beforeDetails" | "firstPageInfo"
    >
  > & { h: number; w: number };
  localizedResource: L;
  palette: Palette;
  showImage: boolean;
};

//------------------------------------------------------------------------------
// Resource Card Preview
//------------------------------------------------------------------------------

export default function ResourceCardPreview<
  R extends Resource,
  L extends LocalizedResource<R>,
>({
  Card,
  localizedResource,
  palette,
  showImage,
}: ResourceCardPreviewProps<R, L>) {
  const { t } = useI18nLangContext(i18nContext);
  const [pageCount, setPageCount] = useState(1);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  const setClampedPageCount = useCallback((count: number | undefined) => {
    setPageCount(count || 1);
    setSelectedPageIndex((prev) =>
      Math.min(prev, Math.max(0, (count || 1) - 1)),
    );
  }, []);

  const movePrevious = useCallback(() => {
    setSelectedPageIndex((prev) => (prev > 0 ? prev - 1 : pageCount - 1));
  }, [pageCount]);

  const moveNext = useCallback(() => {
    setSelectedPageIndex((prev) => (prev + 1) % pageCount);
  }, [pageCount]);

  return (
    <VStack gap={3} py={2} w="full">
      <Box
        h={`${Card.h}in`}
        overflow="hidden"
        position="relative"
        w={`${Card.w}in`}
      >
        <Card
          left={0}
          localizedResource={localizedResource}
          mode="paginated"
          onPageCountChange={setClampedPageCount}
          palette={palette}
          position="absolute"
          selectedPageIndex={selectedPageIndex}
          showImage={showImage}
          top={0}
        />
      </Box>

      <HStack gap={3}>
        <IconButton
          Icon={ArrowLeftIcon}
          disabled={pageCount <= 1}
          label={t("previous")}
          onClick={movePrevious}
          size="xs"
          variant="ghost"
        />
        <Text
          fontSize="sm"
          fontVariantNumeric="tabular-nums"
          minW={12}
          textAlign="center"
        >
          {selectedPageIndex + 1}/{pageCount}
        </Text>
        <IconButton
          Icon={ArrowRightIcon}
          disabled={pageCount <= 1}
          label={t("next")}
          onClick={moveNext}
          size="xs"
          variant="ghost"
        />
      </HStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  next: {
    en: "Next page",
    it: "Pagina successiva",
  },
  previous: {
    en: "Previous page",
    it: "Pagina precedente",
  },
};
