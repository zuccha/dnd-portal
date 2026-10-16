import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedCreatureFamily } from "~/models/resources/creature-families/localized-creature-family";
import Field from "~/ui/field";
import Input from "~/ui/input";
import ResourcePrintDeckEntryEditor from "./resource-print-deck-entry-editor";
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
    <ResourcePrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <Field label={t("habitats")}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("habitats", { ...localizedResource.habitats, value })
          }
          placeholder={t("habitats.placeholder")}
          value={localizedResource.habitats.value}
        />
      </Field>
      <Field label={t("treasures")}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("treasures", { ...localizedResource.treasures, value })
          }
          placeholder={t("treasures.placeholder")}
          value={localizedResource.treasures.value}
        />
      </Field>
      <Field label={t("creatures")}>
        <Input
          onValueChange={(value) =>
            onLocalizedResourceUpdate("creatures", { ...localizedResource.creatures, value })
          }
          placeholder={t("creatures.placeholder")}
          value={localizedResource.creatures.value}
        />
      </Field>
    </ResourcePrintDeckEntryEditor>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "creatures": {
    en: "Creatures",
    it: "Creature",
  },
  "creatures.placeholder": {
    en: "E.g. Owlbear, Winter Wolf",
    it: "Es. Orsogufo, Lupo Invernale",
  },
  "habitats": {
    en: "Habitats",
    it: "Habitat",
  },
  "habitats.placeholder": {
    en: "E.g. Arctic, Forest",
    it: "Es. Artico, Foresta",
  },
  "treasures": {
    en: "Treasures",
    it: "Tesori",
  },
  "treasures.placeholder": {
    en: "E.g. Armaments, Individual",
    it: "Es. Armamenti, Individuale",
  },
};
