import { type StackProps } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { serviceStore } from "~/models/resources/services/service-store";
import { useServiceCategoryOptions } from "~/models/types/service-category";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Services Filters
//------------------------------------------------------------------------------

export default function ServicesFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = serviceStore.useFilters();

  const categoryOptions = useServiceCategoryOptions();

  return (
    <CaptionInput caption={t("categories")} w="full" {...props}>
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
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  categories: {
    en: "Category",
    it: "Categoria",
  },
};
