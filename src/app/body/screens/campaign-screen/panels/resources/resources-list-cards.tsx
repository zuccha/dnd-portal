import { Box, Wrap } from "@chakra-ui/react";
import { useIsGM } from "../../../../../../resources/campaign-role";
import type {
  LocalizedResource,
  Resource,
} from "../../../../../../resources/resource";
import type { StoreUpdater } from "../../../../../../store/store";
import ResourcesListEmpty from "./resources-list-empty";

//----------------------------------------------------------------------------
// Create Resources List Cards
//----------------------------------------------------------------------------

export function createResourcesListCards<
  R extends Resource,
  L extends LocalizedResource<R>
>(
  useLocalizedResources: (campaignId: string) => L[] | undefined,
  useSetEditedResource: (campaignId: string) => StoreUpdater<R | undefined>,
  ResourceCard: React.FC<{ resource: L; onClickTitle?: () => void }>
) {
  return function ListCards({ campaignId }: { campaignId: string }) {
    const isGM = useIsGM(campaignId);
    const localizedResources = useLocalizedResources(campaignId);
    const setEditedResource = useSetEditedResource(campaignId);

    if (!localizedResources) return null;

    return (
      <Box bgColor="bg.subtle" w="full">
        {localizedResources.length ? (
          <Wrap bgColor="bg.subtle" gap={4} justify="center" p={4} w="full">
            {localizedResources.map((localizedResource) => (
              <ResourceCard
                key={localizedResource.id}
                onClickTitle={
                  isGM
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
