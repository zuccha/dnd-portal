import { type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { chronicleEntryStore } from "~/models/resources/chronicle-entries/chronicle-entry-store";
import CaptionInput from "~/ui/caption-input";
import ChronicleDateInput from "../../chronicle-date-input";

const useChronicleEntryFilters = chronicleEntryStore.useFilters;

//------------------------------------------------------------------------------
// Chronicle Entries Filters
//------------------------------------------------------------------------------

export default function ChronicleEntriesFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, { set: setFilters }] = useChronicleEntryFilters();

  return (
    <VStack align="stretch" gap={2} {...props}>
      <CaptionInput caption={t("date_min")} w="full">
        <ChronicleDateInput
          onChange={(value) => setFilters({ date_min: value })}
          size="sm"
          value={filters.date_min}
          w="full"
        />
      </CaptionInput>
      <CaptionInput caption={t("date_max")} w="full">
        <ChronicleDateInput
          onChange={(value) => setFilters({ date_max: value })}
          size="sm"
          value={filters.date_max}
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
  date_max: { en: "Maximum date", it: "Data massima" },
  date_min: { en: "Minimum date", it: "Data minima" },
};
