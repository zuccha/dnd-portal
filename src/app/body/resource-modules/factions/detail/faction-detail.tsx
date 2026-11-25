import { factionStore } from "~/models/resources/factions/faction-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";

//------------------------------------------------------------------------------
// Faction Detail Resource
//------------------------------------------------------------------------------

type FactionDetailResource = ReturnType<typeof factionStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Faction Detail
//------------------------------------------------------------------------------

export default function FactionDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: FactionDetailResource;
}) {
  return <ResourceDetail actions={actions} resource={resource} />;
}
