import { Box, Wrap } from "@chakra-ui/react";
import type {
  Resource,
  ResourceTranslation,
} from "../../../../../../resources/resource";
import ResourcesListEmpty from "./resources-list-empty";

//----------------------------------------------------------------------------
// Create Resources List Cards
//----------------------------------------------------------------------------

export function createResourcesListCards<
  R extends Resource,
  T extends ResourceTranslation<R>
>(
  useTranslations: (campaignId: string) => T[] | undefined,
  useSetEditedResource: (
    campaignId: string
  ) => [(resource: R | undefined) => void, boolean],
  ResourceCard: React.FC<{ resource: T; onClickTitle?: () => void }>
) {
  return function ListCards({ campaignId }: { campaignId: string }) {
    const translations = useTranslations(campaignId);
    const [setEditedResource, canEdit] = useSetEditedResource(campaignId);

    if (!translations) return null;

    return (
      <Box bgColor="bg.subtle" w="full">
        {translations.length ? (
          <Wrap bgColor="bg.subtle" gap={4} justify="center" p={4} w="full">
            {translations.map((translation) => (
              <ResourceCard
                key={translation.id}
                onClickTitle={
                  canEdit
                    ? () => setEditedResource(translation._raw)
                    : undefined
                }
                resource={translation}
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
