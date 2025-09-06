import { Box, Wrap } from "@chakra-ui/react";
import type {
  LocalizedResource,
  Resource,
} from "../../../../../../resources/resource";
import ResourcesListEmpty from "./resources-list-empty";

//----------------------------------------------------------------------------
// Create Resources List Cards
//----------------------------------------------------------------------------

export function createResourcesListCards<
  R extends Resource,
  L extends LocalizedResource<R>
>(
  useLocalizedResources: (campaignId: string) => L[] | undefined,
  useSetEditedResource: (
    campaignId: string
  ) => [(resource: R | undefined) => void, boolean],
  ResourceCard: React.FC<{ resource: L; onClickTitle?: () => void }>
) {
  return function ListCards({ campaignId }: { campaignId: string }) {
    const localizedResources = useLocalizedResources(campaignId);
    const [setEditedResource, canEdit] = useSetEditedResource(campaignId);

    if (!localizedResources) return null;

    return (
      <Box bgColor="bg.subtle" w="full">
        {localizedResources.length ? (
          <Wrap bgColor="bg.subtle" gap={4} justify="center" p={4} w="full">
            {localizedResources.map((localizedResource) => (
              <ResourceCard
                key={localizedResource.id}
                onClickTitle={
                  canEdit
                    ? () => setEditedResource(localizedResource._raw)
                    : undefined
                }
                resource={localizedResource}
              />
            ))}
          </Wrap>
        ) : (
          <ResourcesListEmpty />
        )}
      </Box>
    );
  };
}
