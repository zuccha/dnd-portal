import { Box, Wrap } from "@chakra-ui/react";
import type { LocalizedResource } from "../../../../../../resources/localized-resource";
import type { Resource } from "../../../../../../resources/resource";
import ResourcesListEmpty from "./resources-list-empty";

//----------------------------------------------------------------------------
// Resources List Cards
//----------------------------------------------------------------------------

export type ListCardsProps<
  R extends Resource,
  L extends LocalizedResource<R>
> = {
  Card: React.FC<{
    gm: boolean;
    localizedResource: L;
    onOpen: (resource: R) => void;
  }>;
  gm: boolean;
  localizedResources: L[];
  onOpen: (resource: R) => void;
};

export default function ListCards<
  R extends Resource,
  L extends LocalizedResource<R>
>({ Card, gm, localizedResources, onOpen }: ListCardsProps<R, L>) {
  if (!localizedResources) return null;

  return (
    <Box bgColor="bg.subtle" w="full">
      {localizedResources.length ? (
        <Wrap bgColor="bg.subtle" gap={4} justify="center" p={4} w="full">
          {localizedResources.map((localizedResource) => (
            <Card
              gm={gm}
              key={localizedResource.id}
              localizedResource={localizedResource}
              onOpen={onOpen}
            />
          ))}
        </Wrap>
      ) : (
        <ResourcesListEmpty />
      )}
    </Box>
  );
}
