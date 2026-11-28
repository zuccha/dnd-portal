import { VStack, type StackProps } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { deityStore } from "~/models/resources/deities/deity-store";
import { useCreatureAlignmentOptions } from "~/models/types/creature-alignment";
import { useDeityDomainOptions } from "~/models/types/deity-domain";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Deities Filters
//------------------------------------------------------------------------------

export default function DeitiesFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, { set: setFilters }] = useDeityFilters();
  const alignmentOptions = useCreatureAlignmentOptions();
  const domainOptions = useDeityDomainOptions();

  return (
    <VStack {...props}>
      <CaptionInput caption={t("alignment")} w="full">
        <InclusionSelect
          includes={filters.alignment ?? {}}
          onValueChange={(alignment) =>
            setFilters({ alignment: { ...filters.alignment, ...alignment } })
          }
          options={alignmentOptions}
          placeholder={t("alignment")}
          size="sm"
          w="full"
        />
      </CaptionInput>
      <CaptionInput caption={t("domain")} w="full">
        <InclusionSelect
          includes={filters.domain ?? {}}
          onValueChange={(domain) => setFilters({ domain: { ...filters.domain, ...domain } })}
          options={domainOptions}
          placeholder={t("domain")}
          size="sm"
          w="full"
        />
      </CaptionInput>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Deity Filters Hook
//------------------------------------------------------------------------------

const useDeityFilters = deityStore.useFilters;

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  alignment: { en: "Alignment", it: "Allineamento" },
  domain: { en: "Domain", it: "Dominio" },
};
