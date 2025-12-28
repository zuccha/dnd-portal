import { createListCollection } from "@chakra-ui/react";
import { useMemo } from "react";
import z from "zod";
import useDebouncedState from "~/hooks/use-debounced-value";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useSelectedCampaign } from "~/models/campaign";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { useResourcesModulesFilter } from "~/models/resources/resources-modules-filter";
import InclusionSelect from "~/ui/inclusion-select";
import Input from "~/ui/input";
import Select from "~/ui/select";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Create Resources Generic Filters
//------------------------------------------------------------------------------

export type ResourcesGenericFiltersProps = {
  campaignId: string;
};

export function createResourcesGenericFilters<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(store: ResourceStore<R, L, F, DBR, DBT>, _context: ResourcesContext<R>) {
  return function ResourcesModulesFilter(_props: ResourcesGenericFiltersProps) {
    const { lang, t } = useI18nLangContext(i18nContext);
    const campaign = useSelectedCampaign(); // TODO: Get campaign from campaignId
    const [modules, setModules] = useResourcesModulesFilter(campaign?.id ?? "");
    const [filters, setFilters] = store.useFilters();
    const [tempFilters, setTempFilters] = useDebouncedState(
      filters,
      setFilters,
      200,
    );

    const orderOptions = useMemo(
      () =>
        createListCollection({
          items: store.orderOptions.map(({ label, value }) => ({
            label: translate(label, lang),
            value,
          })),
        }),
      [lang],
    );

    const options = useMemo(() => {
      if (!campaign) return [];
      return [
        ...campaign.modules.map(({ id, name }) => ({ label: name, value: id })),
        { label: campaign.name, value: campaign.id },
      ];
    }, [campaign]);

    return (
      <>
        <InclusionSelect
          disabled={!options.length}
          includes={modules}
          minW="10em"
          onValueChange={(partial) =>
            setModules((prev) => ({ ...prev, ...partial }))
          }
          options={options}
          size="sm"
        >
          {t("modules")}
        </InclusionSelect>

        <Select
          onValueChange={(value) => {
            const order = value.split(".");
            const order_by = order[0] ?? "name";
            const maybe_order_dir = z.enum(["asc", "desc"]).safeParse(order[1]);
            const order_dir = maybe_order_dir.data ?? "asc";
            setTempFilters((prev) => ({ ...prev, order_by, order_dir }));
          }}
          options={orderOptions}
          size="sm"
          value={`${tempFilters.order_by}.${tempFilters.order_dir}`}
          w="13.5em"
        />

        <Input
          groupProps={{ w: "auto" }}
          id={`filter-${store.name.s}-name`}
          onValueChange={(name) =>
            setTempFilters((prev) => ({ ...prev, name }))
          }
          placeholder={t("name.placeholder")}
          size="sm"
          value={tempFilters.name}
          w="15em"
        />
      </>
    );
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "modules": {
    en: "Modules",
    it: "Moduli",
  },
  "name.placeholder": {
    en: "Name",
    it: "Nome",
  },
};
