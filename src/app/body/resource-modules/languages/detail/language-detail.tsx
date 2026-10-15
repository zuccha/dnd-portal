import { SimpleGrid } from "@chakra-ui/react";
import { languageStore } from "~/models/resources/languages/language-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type LanguageDetailResource = ReturnType<typeof languageStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Language Detail
//------------------------------------------------------------------------------

export default function LanguageDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: LanguageDetailResource;
}) {
  const language = resource;

  return (
    <ResourceDetail actions={actions} resource={language}>
      {language && (
        <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
          {language.origin.value && (
            <ResourceDetailField label={language.origin.label}>
              {language.origin.value}
            </ResourceDetailField>
          )}
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}
