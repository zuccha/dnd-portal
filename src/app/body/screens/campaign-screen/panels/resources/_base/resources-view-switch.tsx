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
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Create Resources ViewSwitch
//------------------------------------------------------------------------------

type ResourcesViewSwitchProps = {
  campaignId: string;
};

export function createResourcesViewSwitch<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(_store: ResourceStore<R, L, F, DBR, DBT>, context: ResourcesContext<R>) {
  return function ResourcesViewSwitch(_props: ResourcesViewSwitchProps) {
    const view = context.useView();

    return (
      <BinaryButton
        onValueChange={context.setView}
        options={viewOptions}
        value={view}
      />
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
