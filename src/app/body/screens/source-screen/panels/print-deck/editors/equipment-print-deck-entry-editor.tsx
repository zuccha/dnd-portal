import { HStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedArmor } from "~/models/resources/equipment/armors/localized-armor";
import type { LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import type { LocalizedTool } from "~/models/resources/equipment/tools/localized-tool";
import type { LocalizedWeapon } from "~/models/resources/equipment/weapons/localized-weapon";
import Field from "~/ui/field";
import Input from "~/ui/input";
import ResourcePrintDeckEntryEditor from "./resource-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Equipment Print Deck Entry Editor Props
//------------------------------------------------------------------------------

type EquipmentLocalizedResource = LocalizedArmor | LocalizedItem | LocalizedTool | LocalizedWeapon;
type EquipmentPrintDeckEntryEditorProps = PrintDeckEntryEditorProps<EquipmentLocalizedResource> & {
  children?: ReactNode;
};

//------------------------------------------------------------------------------
// Equipment Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function EquipmentPrintDeckEntryEditor({
  children,
  localizedResource,
  onLocalizedResourceUpdate,
}: EquipmentPrintDeckEntryEditorProps) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <ResourcePrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <HStack align="stretch">
        <Field label={t("cost")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("cost", { ...localizedResource.cost, value })
            }
            placeholder={t("cost.placeholder")}
            value={localizedResource.cost.value}
          />
        </Field>
        <Field label={t("weight")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("weight", { ...localizedResource.weight, value })
            }
            placeholder={t("weight.placeholder")}
            value={localizedResource.weight.value}
          />
        </Field>
      </HStack>
      {children}
    </ResourcePrintDeckEntryEditor>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "cost": {
    en: "Cost",
    it: "Costo",
  },
  "cost.placeholder": {
    en: "E.g. 10 gp",
    it: "Es. 10 mo",
  },
  "weight": {
    en: "Weight",
    it: "Peso",
  },
  "weight.placeholder": {
    en: "E.g. 5 lb",
    it: "Es. 2 kg",
  },
};
