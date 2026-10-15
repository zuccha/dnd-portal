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
    item && (item.usageCount.value || item.consumableStatus.value) ? (
      <>
        <ResourceDetailField label={item.consumableStatus.label}>
          {item.consumableStatus.value}
        </ResourceDetailField>
        {item.usageCount.value && (
          <ResourceDetailField label={item.usageCount.label}>
            {item.usageCount.value}
          </ResourceDetailField>
        )}
      </>
    ) : undefined;

  return <EquipmentDetail actions={actions} resource={item} uses={uses} />;
}
