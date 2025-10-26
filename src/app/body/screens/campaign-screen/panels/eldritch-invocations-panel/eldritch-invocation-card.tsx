import { Span } from "@chakra-ui/react";
import type { EldritchInvocation } from "../../../../../../resources/eldritch-invocation";
import { useIsEldritchInvocationSelected } from "../../../../../../resources/eldritch-invocations-store";
import type { LocalizedEldritchInvocation } from "../../../../../../resources/localized-eldritch-invocation";
import ResourceCard from "../resources/resource-card";

//------------------------------------------------------------------------------
// EldritchInvocation Card
//------------------------------------------------------------------------------

export type EldritchInvocationCardProps = {
  gm: boolean;
  localizedResource: LocalizedEldritchInvocation;
  onOpen: (resource: EldritchInvocation) => void;
};

export default function EldritchInvocationCard({
  gm,
  localizedResource,
  onOpen,
}: EldritchInvocationCardProps) {
  const { _raw, campaign, description, id, name, prerequisite } =
    localizedResource;

  const [selected, { toggle }] = useIsEldritchInvocationSelected(id);

  return (
    <ResourceCard
      gm={gm}
      name={name}
      onOpen={() => onOpen(localizedResource._raw)}
      onToggleSelected={toggle}
      selected={selected}
      visibility={_raw.visibility}
    >
      <ResourceCard.Caption>{prerequisite}</ResourceCard.Caption>

      <ResourceCard.Description description={description} />

      <ResourceCard.Caption>
        <Span></Span>
        <Span>{campaign}</Span>
      </ResourceCard.Caption>
    </ResourceCard>
  );
}
