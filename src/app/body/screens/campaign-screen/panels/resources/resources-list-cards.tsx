import { Box, Wrap } from "@chakra-ui/react";
import type {
  Resource,
  ResourceTranslation,
} from "../../../../../../resources/resource";
import ResourcesListEmpty from "./resources-list-empty";

//----------------------------------------------------------------------------
// Create Resource List Cards
//----------------------------------------------------------------------------

export function createResourceListCards<
  R extends Resource,
  T extends ResourceTranslation<R>
>(
  useTranslations: (campaignId: string) => T[] | undefined,
  ResourceCard: React.FC<{ resource: T }>
) {
  return function ListCards({ campaignId }: { campaignId: string }) {
    const translations = useTranslations(campaignId);

    if (!translations) return null;

    return (
      <Box bgColor="bg.subtle" w="full">
        <Wrap bgColor="bg.subtle" gap={4} justify="center" p={4} w="full">
          {translations.length ? (
            translations.map((translation) => (
              <ResourceCard key={translation.id} resource={translation} />
            ))
          ) : (
            <ResourcesListEmpty />
          )}
        </Wrap>
      </Box>
    );
  };
}
