import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedCreatureFamily } from "~/models/resources/creature-families/localized-creature-family";
import Field from "~/ui/field";
import Input from "~/ui/input";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Creature Family Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function CreatureFamilyPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedCreatureFamily>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <>
      <Field label={localizedResource.habitats.label}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("habitats", { ...localizedResource.habitats, value })
          }
          placeholder={t("habitats.placeholder")}
          value={localizedResource.habitats.value}
        />
      </Field>
      <Field label={localizedResource.treasures.label}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("treasures", { ...localizedResource.treasures, value })
          }
          placeholder={t("treasures.placeholder")}
          value={localizedResource.treasures.value}
        />
      </Field>
      <Field label={localizedResource.creatures.label}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("creatures", { ...localizedResource.creatures, value })
          }
          placeholder={t("creatures.placeholder")}
          value={localizedResource.creatures.value}
        />
      </Field>
    </>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "creatures.placeholder": {
    en: "E.g. Owlbear, Winter Wolf",
    it: "Es. Orsogufo, Lupo Invernale",
  },
  "habitats.placeholder": {
    en: "E.g. Arctic, Forest",
    it: "Es. Artico, Foresta",
  },
  "treasures.placeholder": {
    en: "E.g. Armaments, Individual",
    it: "Es. Armamenti, Individuale",
  },
};
