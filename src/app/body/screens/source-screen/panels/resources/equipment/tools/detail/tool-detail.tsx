import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import ResourceDetailField from "../../../resource-detail-field";
import EquipmentDetail from "../../equipment-detail";

type ToolDetailResource = ReturnType<typeof toolStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Tool Detail
//------------------------------------------------------------------------------

export default function ToolDetail({ resource }: { resource: ToolDetailResource }) {
  const { t } = useI18nLangContext(i18nContext);
  const tool = resource;

  return (
    <EquipmentDetail resource={tool}>
      {tool && <ResourceDetailField label={t("ability")}>{tool.ability}</ResourceDetailField>}
    </EquipmentDetail>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  ability: { en: "Ability", it: "Abilità" },
};
