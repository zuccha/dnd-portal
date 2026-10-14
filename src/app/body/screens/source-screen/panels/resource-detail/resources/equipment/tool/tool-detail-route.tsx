import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import ResourceDetailField from "../../../resource-detail-field";
import EquipmentDetailRoute from "../equipment-detail-route";

const useLocalizedResource = toolStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Tool Detail Route
//------------------------------------------------------------------------------

export default function ToolDetailRoute({ resourceId }: { resourceId: string }) {
  const { t } = useI18nLangContext(i18nContext);
  const tool = useLocalizedResource(resourceId);

  return (
    <EquipmentDetailRoute resource={tool}>
      {tool && <ResourceDetailField label={t("ability")}>{tool.ability}</ResourceDetailField>}
    </EquipmentDetailRoute>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  ability: { en: "Ability", it: "Abilità" },
};
