import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { itemStore } from "~/models/resources/equipment/items/item-store";
import ResourceDetailField from "../../../resource-detail-field";
import EquipmentDetail from "../../equipment-detail";
import type { ResourceDetailAction } from "../../../resource-detail";

type ItemDetailResource = ReturnType<typeof itemStore.useLocalizedResource>;

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
  const { t } = useI18nLangContext(i18nContext);
  const item = resource;
  const uses = item ? (
    item._raw.charges === 1 && item._raw.consumable ? (
      <ResourceDetailField label={t("consumable")}>{t("yes")}</ResourceDetailField>
    ) : item._raw.charges ? (
      <ResourceDetailField label={t(item._raw.consumable ? "usages" : "charges")}>
        {item.charges}
      </ResourceDetailField>
    ) : undefined
  ) : undefined;

  return <EquipmentDetail actions={actions} resource={item} uses={uses} />;
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  charges: { en: "Charges", it: "Cariche" },
  consumable: { en: "Consumable", it: "Consumabile" },
  usages: { en: "Usages", it: "Usi" },
  yes: { en: "Yes", it: "Sì" },
};
