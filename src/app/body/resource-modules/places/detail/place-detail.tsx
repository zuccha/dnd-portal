import { HStack, Span } from "@chakra-ui/react";
import { placeStore } from "~/models/resources/places/place-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type PlaceDetailResource = ReturnType<typeof placeStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Place Detail
//------------------------------------------------------------------------------

export default function PlaceDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: PlaceDetailResource;
}) {
  return (
    <ResourceDetail actions={actions} resource={resource}>
      {resource && (
        <ResourceDetailField label={resource.position_label}>
          {resource.position.length ? (
            <HStack gap={1} separator={<Span css={noBorderCss}>›</Span>} wrap="wrap">
              {resource.position.map(({ id, kind, name }) => (
                <RouterLink key={`${kind}:${id}`} to={resourceDetailRoute(kind, id)}>
                  {name}
                </RouterLink>
              ))}
            </HStack>
          ) : (
            "-"
          )}
        </ResourceDetailField>
      )}
    </ResourceDetail>
  );
}

const noBorderCss = { "&": { borderInlineStartWidth: 0 } };
