import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedTool } from "~/models/resources/equipment/tools/localized-tool";
import Field from "~/ui/field";
import Input from "~/ui/input";
import EquipmentPrintDeckEntryEditor from "./equipment-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Tool Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function ToolPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedTool>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <EquipmentPrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <Field label={t("ability")}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("ability", { ...localizedResource.ability, value })
          }
          placeholder={t("ability.placeholder")}
          value={localizedResource.ability.value}
        />
      </Field>
    </EquipmentPrintDeckEntryEditor>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ability": {
    en: "Ability",
    it: "Abilità",
  },
  "ability.placeholder": {
    en: "E.g. Wisdom",
    it: "Es. Saggezza",
  },
};
