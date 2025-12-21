import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useSelectedCampaign } from "~/models/campaign";
import { useResourcesModulesFilter } from "~/models/resources/resources-modules-filter";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Resources Modules Filter
//------------------------------------------------------------------------------

export default function ResourcesModulesFilter() {
  const { t } = useI18nLangContext(i18nContext);
  const campaign = useSelectedCampaign();
  const [filter, setFilter] = useResourcesModulesFilter(campaign?.id ?? "");

  const options = useMemo(() => {
    if (!campaign) return [];
    return [
      ...campaign.modules.map(({ id, name }) => ({ label: name, value: id })),
      { label: campaign.name, value: campaign.id },
    ];
  }, [campaign]);

  return (
    <InclusionSelect
      disabled={!options.length}
      includes={filter}
      minW="10em"
      onValueChange={(partial) =>
        setFilter((prev) => ({ ...prev, ...partial }))
      }
      options={options}
      size="sm"
    >
      {t("modules")}
    </InclusionSelect>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  modules: {
    en: "Modules",
    it: "Moduli",
  },
};
