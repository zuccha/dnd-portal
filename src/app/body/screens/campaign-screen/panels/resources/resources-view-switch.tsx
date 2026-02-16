import { HStack } from "@chakra-ui/react";
import { Grid2X2Icon, ListIcon } from "lucide-react";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import BinaryButton, { type BinaryButtonProps } from "~/ui/binary-button";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";
import { usePaletteNameOptions } from "~/utils/palette";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Create Resources ViewSwitch
//------------------------------------------------------------------------------

type ResourcesViewSwitchProps = {
  sourceId: string;
};

export function createResourcesViewSwitch<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(_store: ResourceStore<R, L, F, DBR, DBT>, context: ResourcesContext<R>) {
  return function ResourcesViewSwitch(_props: ResourcesViewSwitchProps) {
    const paletteName = context.usePaletteName();
    const view = context.useView();
    const zoom = context.useZoom();

    const paletteNameOptions = usePaletteNameOptions();

    return (
      <HStack>
        {view === "cards" && (
          <>
            <NumberInput
              formatOptions={{ style: "percent" }}
              max={2}
              min={0.2}
              onValueChange={context.setZoom}
              size="xs"
              step={0.1}
              value={zoom * 100}
              w="5em"
            />

            <Select.Enum
              onValueChange={context.setPaletteName}
              options={paletteNameOptions}
              size="xs"
              value={paletteName}
              w="8em"
            />
          </>
        )}

        <BinaryButton
          onValueChange={context.setView}
          options={viewOptions}
          value={view}
        />
      </HStack>
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
