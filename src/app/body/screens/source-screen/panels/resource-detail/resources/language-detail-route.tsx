import { languageStore } from "~/models/resources/languages/language-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = languageStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Language Detail Route
//------------------------------------------------------------------------------

export default function LanguageDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
