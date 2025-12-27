import { useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useSelectedCampaign } from "~/models/campaign";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource, ResourceFilters } from "~/models/resources/resource";
import type { ResourceStore } from "~/models/resources/resource-store";
import { useResourcesModulesFilter } from "~/models/resources/resources-modules-filter";
import InclusionSelect from "~/ui/inclusion-select";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Create Resources Counter
//------------------------------------------------------------------------------

export type ResourcesModulesFilterProps = {
  campaignId: string;
};

export function createResourcesModulesFilter<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(_store: ResourceStore<R, L, F, DBR, DBT>, _context: ResourcesContext<R>) {
  return function ResourcesModulesFilter(_props: ResourcesModulesFilterProps) {
    const { t } = useI18nLangContext(i18nContext);
    const campaign = useSelectedCampaign(); // TODO: Get campaign from campaignId
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
  };
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
