import { type StackProps } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import { useCreatureAbilityOptions } from "~/models/types/creature-ability";
import { useToolTypeOptions } from "~/models/types/tool-type";
import CaptionInput from "~/ui/caption-input";
import InclusionSelect from "~/ui/inclusion-select";
import EquipmentFilters from "../equipment-filters";

//------------------------------------------------------------------------------
// Tools Filters
//------------------------------------------------------------------------------

export default function ToolsFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = toolStore.useFilters();

  const abilityOptions = useCreatureAbilityOptions();
  const typeOptions = useToolTypeOptions();

  return (
    <EquipmentFilters filters={filters} onFiltersChange={setFilters} {...props}>
      <CaptionInput caption={t("types")} w="full">
        <InclusionSelect
          includes={filters.types ?? {}}
          onValueChange={(partial) =>
            setFilters({ types: { ...filters.types, ...partial } })
          }
          options={typeOptions}
          placeholder={t("types")}
          size="sm"
          w="full"
        />
      </CaptionInput>

      <CaptionInput caption={t("abilities")} w="full">
        <InclusionSelect
          includes={filters.abilities ?? {}}
          onValueChange={(partial) =>
            setFilters({ abilities: { ...filters.abilities, ...partial } })
          }
          options={abilityOptions}
          placeholder={t("abilities")}
          size="sm"
          w="full"
        />
      </CaptionInput>
    </EquipmentFilters>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  abilities: {
    en: "Abilities",
    it: "Abilità",
  },
  types: {
    en: "Types",
    it: "Tipi",
  },
};
