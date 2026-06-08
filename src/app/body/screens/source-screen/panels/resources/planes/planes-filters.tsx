import { type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { planeStore } from "~/models/resources/planes/plane-store";
import { useCreatureAlignmentOptions } from "~/models/types/creature-alignment";
import { usePlaneCategoryOptions } from "~/models/types/plane-category";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Planes Filters
//------------------------------------------------------------------------------

export default function PlanesFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = planeStore.useFilters();

  const categoryOptions = usePlaneCategoryOptions();
  const alignmentOptions = useCreatureAlignmentOptions();

  return (
    <VStack {...props}>
      <CaptionInput caption={t("categories")} w="full">
        <InclusionSelect
          includes={filters.categories ?? {}}
          onValueChange={(partial) =>
            setFilters({ categories: { ...filters.categories, ...partial } })
          }
          options={categoryOptions}
          placeholder={t("categories")}
          size="sm"
          w="full"
        />
      </CaptionInput>

      <CaptionInput caption={t("alignments")} w="full">
        <InclusionSelect
          includes={filters.alignments ?? {}}
          onValueChange={(partial) =>
            setFilters({ alignments: { ...filters.alignments, ...partial } })
          }
          options={alignmentOptions}
          placeholder={t("alignments")}
          size="sm"
          w="full"
        />
      </CaptionInput>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  alignments: {
    en: "Alignments",
    it: "Allineamenti",
  },
  categories: {
    en: "Categories",
    it: "Categorie",
  },
};
