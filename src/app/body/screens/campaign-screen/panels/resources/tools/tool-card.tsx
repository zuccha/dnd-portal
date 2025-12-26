import { Span } from "@chakra-ui/react";
import type { LocalizedTool } from "~/models/resources/equipment/tools/localized-tool";
import type { Tool } from "~/models/resources/equipment/tools/tool";
import { useIsToolSelected } from "~/models/resources/equipment/tools/tools-store";
import ResourceCard from "../_base/resource-card";

//------------------------------------------------------------------------------
// Tool Card
//------------------------------------------------------------------------------

export type ToolCardProps = {
  canEdit: boolean;
  localizedResource: LocalizedTool;
  onOpen: (resource: Tool) => void;
};

export default function ToolCard({
  canEdit,
  localizedResource,
  onOpen,
}: ToolCardProps) {
  const { _raw, ability, campaign, cost, id, name, description, type, weight } =
    localizedResource;

  const [selected, { toggle }] = useIsToolSelected(id);

  return (
    <ResourceCard
      canEdit={canEdit}
      name={name}
      onOpen={() => onOpen(localizedResource._raw)}
      onToggleSelected={toggle}
      selected={selected}
      visibility={_raw.visibility}
    >
      <ResourceCard.Caption>
        <Span>{`${type} (${ability})`}</Span>
        <Span>{weight}</Span>
      </ResourceCard.Caption>

      <ResourceCard.Description description={description} />

      <ResourceCard.Caption>
        <Span>{cost}</Span>
        <Span>{campaign}</Span>
      </ResourceCard.Caption>
    </ResourceCard>
  );
}
