import { HStack, type StackProps } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { planeStore } from "~/models/resources/planes/plane-store";
import { useCreatureAlignmentOptions } from "~/models/types/creature-alignment";
import { usePlaneCategoryOptions } from "~/models/types/plane-category";
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
    <HStack {...props}>
      <InclusionSelect
        includes={filters.categories ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ categories: { ...filters.categories, ...partial } })
        }
        options={categoryOptions}
        size="sm"
      >
        {t("categories")}
      </InclusionSelect>

      <InclusionSelect
        includes={filters.alignments ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ alignments: { ...filters.alignments, ...partial } })
        }
        options={alignmentOptions}
        size="sm"
      >
        {t("alignments")}
      </InclusionSelect>
    </HStack>
  );
}

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
