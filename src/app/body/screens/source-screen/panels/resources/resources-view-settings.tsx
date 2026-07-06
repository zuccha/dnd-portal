import { HStack, VStack } from "@chakra-ui/react";
import { Grid2X2Icon, ListIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import BinaryButton, { type BinaryButtonProps } from "~/ui/binary-button";
import CaptionInput from "~/ui/caption-input";
import Checkbox from "~/ui/checkbox";
import NumberInput from "~/ui/number-input";
import Section from "~/ui/section";
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
  const { useCardMode, usePaletteName, useShowImage, useView, useZoom } =
    context;

  return function ResourcesViewSwitch(_props: ResourcesViewSettingsProps) {
    const { t } = useI18nLangContext(i18nContext);

    const cardMode = useCardMode();
    const paletteName = usePaletteName();
    const showImage = useShowImage();
    const view = useView();
    const zoom = useZoom();

    const paletteNameOptions = usePaletteNameOptions();

    return (
      <Section
        action={
          <BinaryButton
            labels={[t("view.list"), t("view.cards")]}
            onValueChange={context.setView}
            options={viewOptions}
            value={view}
            zoom={0.8}
          />
        }
        title={t("heading")}
      >
        {view === "cards" && (
          <VStack align="flex-start" w="full">
            <HStack w="full" wrap="wrap">
              <CaptionInput caption={t("zoom")} flex={1}>
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
              </CaptionInput>

              <CaptionInput caption={t("accent_color")} flex={1} minW="6.5em">
                <Select.Enum
                  onValueChange={context.setPaletteName}
                  options={paletteNameOptions}
                  size="sm"
                  value={paletteName}
                  w="full"
                />
              </CaptionInput>
            </HStack>

            <CaptionInput caption={t("card_mode")} w="full">
              <Select.Enum
                onValueChange={context.setCardMode}
                options={[
                  { label: t("card_mode_scroll"), value: "scroll" },
                  { label: t("card_mode_paginated"), value: "paginated" },
                ]}
                size="sm"
                value={cardMode}
                w="full"
              />
            </CaptionInput>

            {cardMode === "paginated" && (
              <Checkbox
                label={t("show_images")}
                onValueChange={context.setShowImage}
                value={showImage}
              />
            )}
          </VStack>
        )}
      </Section>
    );
  };
}

//------------------------------------------------------------------------------
// View Options
//------------------------------------------------------------------------------

const viewOptions: BinaryButtonProps<"table", "cards">["options"] = [
  { Icon: ListIcon, value: "table" },
  { Icon: Grid2X2Icon, value: "cards" },
];

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "accent_color": {
    en: "Color",
    it: "Colore",
  },
  "card_mode": {
    en: "Cards",
    it: "Carte",
  },
  "card_mode_paginated": {
    en: "Paginated",
    it: "Paginate",
  },
  "card_mode_scroll": {
    en: "Scrollable",
    it: "Scorrevoli",
  },
  "heading": {
    en: "View",
    it: "Vista",
  },
  "show_images": {
    en: "Show images",
    it: "Mostra immagini",
  },
  "view.cards": {
    en: "Cards",
    it: "Carte",
  },
  "view.list": {
    en: "List",
    it: "Lista",
  },
  "zoom": {
    en: "Zoom",
    it: "Zoom",
  },
};
