import { SimpleGrid, Span } from "@chakra-ui/react";
import { backgroundStore } from "~/models/resources/backgrounds/background-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type BackgroundDetailResource = ReturnType<typeof backgroundStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Background Detail
//------------------------------------------------------------------------------

export default function BackgroundDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: BackgroundDetailResource;
}) {
  const background = resource;
  const fields = background
    ? [background.ability_scores, background.skill_proficiencies].filter(({ value }) =>
        Boolean(value),
      )
    : [];

  return (
    <ResourceDetail actions={actions} resource={background}>
      {background && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          {fields.map(({ label, value }) => (
            <ResourceDetailField key={label} label={label}>
              {value}
            </ResourceDetailField>
          ))}
          {background.feat.id && (
            <ResourceDetailField label={background.feat.label}>
              <RouterLink to={resourceDetailRoute("feat", background.feat.id)}>
                {background.feat.link_text || background.feat.value}
              </RouterLink>
              {background.feat.notes && <Span> ({background.feat.notes})</Span>}
            </ResourceDetailField>
          )}
          {background.tool_proficiency.id && (
            <ResourceDetailField label={background.tool_proficiency.label}>
              <RouterLink to={resourceDetailRoute("tool", background.tool_proficiency.id)}>
                {background.tool_proficiency.link_text || background.tool_proficiency.value}
              </RouterLink>
              {background.tool_proficiency.notes && (
                <Span> ({background.tool_proficiency.notes})</Span>
              )}
            </ResourceDetailField>
          )}
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
