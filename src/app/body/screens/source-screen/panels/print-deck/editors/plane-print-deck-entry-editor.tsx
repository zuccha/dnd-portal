import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedPlane } from "~/models/resources/planes/localized-plane";
import Field from "~/ui/field";
import Input from "~/ui/input";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Plane Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function PlanePrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedPlane>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <Field label={t("alignments")}>
      <Input
        onValueChange={(value) =>
          onLocalizedResourceUpdate("alignments", { ...localizedResource.alignments, value })
        }
        value={localizedResource.alignments.value}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  alignments: {
    en: "Alignments",
    it: "Allineamenti",
  },
};
