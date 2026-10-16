import type { LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import ResourceDetailField from "../../../resource-detail-field";
import EquipmentDetail from "../../equipment-detail";
import type { ResourceDetailAction } from "../../../resource-detail";

type ItemDetailResource = LocalizedItem | undefined;

//------------------------------------------------------------------------------
// Item Detail
//------------------------------------------------------------------------------

export default function ItemDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: ItemDetailResource;
}) {
  const item = resource;
  const uses =
    item && (item.usage_count.value || item.consumable_status.value) ? (
      <>
        <ResourceDetailField label={item.consumable_status.label}>
          {item.consumable_status.value}
        </ResourceDetailField>
        {item.usage_count.value && (
          <ResourceDetailField label={item.usage_count.label}>
            {item.usage_count.value}
          </ResourceDetailField>
        )}
      </>
    ) : undefined;

  return <EquipmentDetail actions={actions} resource={item} uses={uses} />;
}
