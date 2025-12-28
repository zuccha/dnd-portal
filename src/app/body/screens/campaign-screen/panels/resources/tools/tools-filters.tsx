import { HStack, type StackProps } from "@chakra-ui/react";
import { WandIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import { useCreatureAbilityOptions } from "~/models/types/creature-ability";
import { useToolTypeOptions } from "~/models/types/tool-type";
import Icon from "~/ui/icon";
import InclusionButton from "~/ui/inclusion-button";
import InclusionSelect from "~/ui/inclusion-select";

//------------------------------------------------------------------------------
// Tools Filters
//------------------------------------------------------------------------------

export default function ToolsFilters(props: StackProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [filters, setFilters] = toolStore.useFilters();

  const abilityOptions = useCreatureAbilityOptions();
  const typeOptions = useToolTypeOptions();

  return (
    <HStack {...props}>
      <InclusionSelect
        includes={filters.types ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ types: { ...filters.types, ...partial } })
        }
        options={typeOptions}
        size="sm"
      >
        {t("types")}
      </InclusionSelect>

      <InclusionSelect
        includes={filters.abilities ?? {}}
        minW="10em"
        onValueChange={(partial) =>
          setFilters({ abilities: { ...filters.abilities, ...partial } })
        }
        options={abilityOptions}
        size="sm"
      >
        {t("abilities")}
      </InclusionSelect>

      <InclusionButton
        include={filters.magic}
        onValueChange={(magic) => setFilters({ magic })}
        size="sm"
      >
        <Icon Icon={WandIcon} size="sm" />
      </InclusionButton>
    </HStack>
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
