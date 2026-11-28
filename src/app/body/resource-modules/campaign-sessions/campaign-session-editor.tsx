import { DatePicker, HStack, Portal, parseDate } from "@chakra-ui/react";
import { CalendarDaysIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { CampaignSession } from "~/models/resources/campaign-sessions/campaign-session";
import type { CampaignSessionFormData } from "~/models/resources/campaign-sessions/campaign-session-form";
import Field from "~/ui/field";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import { createNumberInputField, createTextareaField } from "../resource-editor-form";
import { useResourceEditorLang } from "../resource-editor-language-context";

//------------------------------------------------------------------------------
// Campaign Session Editor Props
//------------------------------------------------------------------------------

type CampaignSessionEditorProps = { resource: CampaignSession; sourceId: string };

//------------------------------------------------------------------------------
// Create Campaign Session Editor
//------------------------------------------------------------------------------

export function createCampaignSessionEditor(form: Form<CampaignSessionFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Number Field
  //----------------------------------------------------------------------------

  const NumberField = createNumberInputField({
    i18nContext: { label: { en: "Session Number", it: "Numero della sessione" } },
    useField: form.createUseField("number"),
  });

  //----------------------------------------------------------------------------
  // Description Field
  //----------------------------------------------------------------------------

  const DescriptionField = createTextareaField({
    i18nContext: {
      label: { en: "Description", it: "Descrizione" },
      placeholder: { en: "Describe the session", it: "Descrivi la sessione" },
    },
    inputProps: { rows: 12 },
    translatable: true,
    useField: form.createUseField("description"),
  });

  //----------------------------------------------------------------------------
  // Played At Field
  //----------------------------------------------------------------------------

  const usePlayedAtField = form.createUseField("played_at");

  //----------------------------------------------------------------------------
  // Campaign Session Editor
  //----------------------------------------------------------------------------

  return function CampaignSessionEditor({ resource }: CampaignSessionEditorProps) {
    const { lang } = useResourceEditorLang();
    const { t } = useI18nLangContext(i18nContext);
    const playedAt = usePlayedAtField(resource.played_at);

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <NumberField defaultValue={resource.number} />
          <Field label={t("played_at")}>
            <DatePicker.Root
              locale={lang}
              onValueChange={({ value }) => playedAt.onValueChange(value[0]?.toString() ?? null)}
              value={playedAt.value ? [parseDate(playedAt.value)] : []}
            >
              <DatePicker.Control>
                <DatePicker.Input placeholder={t("select_date")} />
                <DatePicker.IndicatorGroup>
                  <DatePicker.Trigger aria-label={t("open_calendar")}>
                    <CalendarDaysIcon size={16} />
                  </DatePicker.Trigger>
                </DatePicker.IndicatorGroup>
              </DatePicker.Control>
              <Portal>
                <DatePicker.Positioner>
                  <DatePicker.Content>
                    <DatePicker.View view="day">
                      <DatePicker.Header />
                      <DatePicker.DayTable />
                    </DatePicker.View>
                    <DatePicker.View view="month">
                      <DatePicker.Header />
                      <DatePicker.MonthTable />
                    </DatePicker.View>
                    <DatePicker.View view="year">
                      <DatePicker.Header />
                      <DatePicker.YearTable />
                    </DatePicker.View>
                  </DatePicker.Content>
                </DatePicker.Positioner>
              </Portal>
            </DatePicker.Root>
          </Field>
        </HStack>
        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  open_calendar: { en: "Open calendar", it: "Apri il calendario" },
  played_at: { en: "Played On", it: "Data" },
  select_date: { en: "Select a date", it: "Seleziona una data" },
};
