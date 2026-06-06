import { Heading, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";
import { usePaletteNameOptions } from "~/utils/palette";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Create Resources View Settings
//------------------------------------------------------------------------------

type ResourcesViewSettingsProps = {
  sourceId: string;
};

export function createResourcesViewSettings<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(_store: ResourceStore<R, L, F, DBR, DBT>, context: ResourcesContext<R>) {
  return function ResourcesViewSwitch(_props: ResourcesViewSettingsProps) {
    const { t } = useI18nLangContext(i18nContext);

    const paletteName = context.usePaletteName();
    const view = context.useView();
    const zoom = context.useZoom();

    const paletteNameOptions = usePaletteNameOptions();

    if (view === "cards") {
      return (
        <VStack align="flex-start" w="full">
          <Heading size="sm">{t("heading")}</Heading>

          <NumberInput
            formatOptions={{ style: "percent" }}
            max={2}
            min={0.2}
            onValueChange={context.setZoom}
            size="sm"
            step={0.1}
            value={zoom * 100}
            w="full"
          />

          <Select.Enum
            onValueChange={context.setPaletteName}
            options={paletteNameOptions}
            size="sm"
            value={paletteName}
            w="full"
          />
        </VStack>
      );
    }

    return null;
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  heading: {
    en: "View",
    it: "Vista",
  },
};
