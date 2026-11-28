import { type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { pcStore } from "~/models/resources/pcs/pc-store";
import { usePcStatusOptions } from "~/models/types/pc-status";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// PCs Filters
//------------------------------------------------------------------------------

const usePcFilters = pcStore.useFilters;

export default function PcsFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, { set: setFilters }] = usePcFilters();
  const options = usePcStatusOptions();

  return (
    <VStack {...props}>
      <CaptionInput caption={t("status")} w="full">
        <InclusionSelect
          includes={filters.statuses ?? {}}
          onValueChange={(statuses) =>
            setFilters({ statuses: { ...filters.statuses, ...statuses } })
          }
          options={options}
          placeholder={t("status")}
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
  status: { en: "Status", it: "Stato" },
};
