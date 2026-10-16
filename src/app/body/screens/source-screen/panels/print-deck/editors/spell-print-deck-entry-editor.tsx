import { HStack, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedSpell } from "~/models/resources/spells/localized-spell";
import Field from "~/ui/field";
import Input from "~/ui/input";
import Switch from "~/ui/switch";
import Textarea from "~/ui/textarea";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Spell Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function SpellPrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedSpell>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <VStack align="stretch" gap={3}>
      <HStack align="stretch">
        <Field label={t("level")}>
          <Input
            onValueChange={(value) => onLocalizedResourceUpdate("level", value)}
            placeholder={t("level.placeholder")}
            value={localizedResource.level}
          />
        </Field>
        <Field label={t("classes")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("characterClassAbbreviations", value)
            }
            placeholder={t("classes.placeholder")}
            value={localizedResource.characterClassAbbreviations}
          />
        </Field>
      </HStack>
      <HStack align="stretch">
        <Field label={t("casting_time")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("castingTime", {
                ...localizedResource.castingTime,
                value,
              })
            }
            placeholder={t("casting_time.placeholder")}
            value={localizedResource.castingTime.value}
          />
        </Field>
        <Field label={t("range")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("range", { ...localizedResource.range, value })
            }
            placeholder={t("range.placeholder")}
            value={localizedResource.range.value}
          />
        </Field>
      </HStack>
      <HStack align="stretch">
        <Field label={t("components")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("components", { ...localizedResource.components, value })
            }
            placeholder={t("components.placeholder")}
            value={localizedResource.components.value}
          />
        </Field>
        <Field label={t("duration")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("duration", {
                ...localizedResource.duration,
                value,
              })
            }
            placeholder={t("duration.placeholder")}
            value={localizedResource.duration.value}
          />
        </Field>
      </HStack>
      <Field label={t("materials")}>
        <Textarea
          onValueChange={(value) =>
            onLocalizedResourceUpdate("materials", { ...localizedResource.materials, value })
          }
          placeholder={t("materials.placeholder")}
          rows={2}
          value={localizedResource.materials.value}
        />
      </Field>
      <HStack gap={4} wrap="wrap">
        <Switch
          label={t("ritual")}
          onValueChange={(value) => onLocalizedResourceUpdate("ritual", value)}
          value={localizedResource.ritual}
        />
        <Switch
          label={t("concentration")}
          onValueChange={(value) => onLocalizedResourceUpdate("concentration", value)}
          value={localizedResource.concentration}
        />
        <Switch
          label={t("emphasize_casting_time")}
          onValueChange={(value) => onLocalizedResourceUpdate("emphasizeCastingTime", value)}
          value={localizedResource.emphasizeCastingTime}
        />
      </HStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "casting_time": {
    en: "Casting Time",
    it: "Lancio",
  },
  "casting_time.placeholder": {
    en: "E.g. 1 action",
    it: "Es. 1 azione",
  },
  "classes": {
    en: "Classes",
    it: "Classi",
  },
  "classes.placeholder": {
    en: "E.g. BRD. CLE. DRU.",
    it: "Es. BAR. CHR. DRU.",
  },
  "components": {
    en: "Components",
    it: "Componenti",
  },
  "components.placeholder": {
    en: "E.g. V, S, M",
    it: "Es. V, S, M",
  },
  "concentration": {
    en: "Concentration",
    it: "Concentrazione",
  },
  "duration": {
    en: "Duration",
    it: "Durata",
  },
  "duration.placeholder": {
    en: "E.g. 1 minute",
    it: "Es. 1 minuto",
  },
  "emphasize_casting_time": {
    en: "Emphasize casting time",
    it: "Evidenzia il tempo di lancio",
  },
  "level": {
    en: "Level",
    it: "Livello",
  },
  "level.placeholder": {
    en: "E.g. 1",
    it: "Es. 1",
  },
  "materials": {
    en: "Materials",
    it: "Materiali",
  },
  "materials.placeholder": {
    en: "E.g. A pearl worth 100 GP",
    it: "Es. Una perla del valore di 100 mo",
  },
  "range": {
    en: "Range",
    it: "Gittata",
  },
  "range.placeholder": {
    en: "E.g. 30 ft",
    it: "Es. 9 m",
  },
  "ritual": {
    en: "Ritual",
    it: "Rituale",
  },
};
