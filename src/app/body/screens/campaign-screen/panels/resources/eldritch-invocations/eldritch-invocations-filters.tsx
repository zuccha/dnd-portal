import { type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { eldritchInvocationStore } from "~/models/resources/eldritch-invocations/eldritch-invocation-store";
import CaptionInput from "~/ui/caption-input";
import NumberInput from "~/ui/number-input";

//------------------------------------------------------------------------------
// EldritchInvocations Filters
//------------------------------------------------------------------------------

export default function EldritchInvocationsFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = eldritchInvocationStore.useFilters();

  return (
    <VStack {...props}>
      <CaptionInput caption={t("min_warlock_level")} w="full">
        <NumberInput
          onValueChange={(warlock_level) => setFilters({ warlock_level })}
          size="sm"
          value={filters.warlock_level ?? 20}
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
  min_warlock_level: {
    en: "Warlock level",
    it: "Livello da warlock",
  },
};
