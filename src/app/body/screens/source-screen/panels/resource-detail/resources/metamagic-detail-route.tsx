import { metamagicStore } from "~/models/resources/metamagics/metamagic-store";
import ResourceDetailContent from "../resource-detail-content";

const useLocalizedResource = metamagicStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Metamagic Detail Route
//------------------------------------------------------------------------------

export default function MetamagicDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
