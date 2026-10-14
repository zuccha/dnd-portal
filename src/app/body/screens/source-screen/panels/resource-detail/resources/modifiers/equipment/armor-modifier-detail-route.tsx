import { armorModifierStore } from "~/models/resources/modifiers/equipment/armors/armor-modifier-store";
import ResourceDetailContent from "../../../resource-detail-content";

const useLocalizedResource = armorModifierStore.useLocalizedResource;

//------------------------------------------------------------------------------
// ArmorModifier Detail Route
//------------------------------------------------------------------------------

export default function ArmorModifierDetailRoute({ resourceId }: { resourceId: string }) {
  return <ResourceDetailContent resource={useLocalizedResource(resourceId)} />;
}
