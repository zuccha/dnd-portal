import { type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { featStore } from "~/models/resources/feats/feat-store";
import { useFeatCategoryOptions } from "~/models/types/feat-category";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";
import NumberInput from "~/ui/number-input";

//------------------------------------------------------------------------------
// Feats Filters
//------------------------------------------------------------------------------

export default function FeatsFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = featStore.useFilters();

  const categoryOptions = useFeatCategoryOptions();

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

      <CaptionInput caption={t("level")} w="full">
        <NumberInput
          onValueChange={(level) => setFilters({ level })}
          size="sm"
          value={filters.level}
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
  categories: {
    en: "Categories",
    it: "Categorie",
  },
  level: {
    en: "Level",
    it: "Livello",
  },
};
