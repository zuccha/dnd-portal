import { useCallback, useEffect, useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { i18nLangProviderContext } from "~/i18n/i18n-lang-provider-context";
import { translate } from "~/i18n/i18n-string";
import type { PrintDeckEntry } from "~/models/print-deck/print-deck-entry";
import { printDeck } from "~/models/print-deck/print-deck-store";
import type { TranslationFields } from "~/models/resources/resource";
import type { LocalizedResourceUnion, ResourceUnion } from "~/models/resources/resource-union";
import { resourceUnionSchema } from "~/models/resources/resource-union";
import { type Form } from "~/utils/form";
import ResourceDialog from "../resources/resource-dialog";
import { applyResourceEditorPreviewPatch } from "../resources/resource-editor-preview";
import PrintDeckEditorPreview from "./print-deck-editor-preview";

const noopSetLang = () => "";

//------------------------------------------------------------------------------
// Print Deck Editor Configuration
//------------------------------------------------------------------------------

export type PrintDeckEditorConfiguration = {
  Editor: React.FC<{ resource: unknown; sourceId: string }>;
  form: Form<Record<string, unknown>>;
  parseFormData: (
    data: Partial<Record<string, unknown>>,
    lang: string,
  ) => Partial<Record<string, unknown>> | string;
  translationFields: TranslationFields<ResourceUnion>[];
  localizeResource: (resource: unknown, context: unknown) => LocalizedResourceUnion;
  useLocalizationContext: (resource: unknown) => unknown;
};

//------------------------------------------------------------------------------
// Print Deck Resource Dialog Props
//------------------------------------------------------------------------------

export type PrintDeckResourceDialogProps = {
  entry: PrintDeckEntry;
  onClose: () => void;
};

//------------------------------------------------------------------------------
// Create Print Deck Resource Dialog
//------------------------------------------------------------------------------

export function createPrintDeckResourceDialog(configuration: PrintDeckEditorConfiguration) {
  const {
    Editor,
    form,
    localizeResource,
    parseFormData,
    translationFields,
    useLocalizationContext,
  } = configuration;
  const { useData, useSubmit, useSubmitError, useValid } = form;

  function PrintDeckResourceDialog({ entry, onClose }: PrintDeckResourceDialogProps) {
    const { t, ti } = useI18nLangContext(i18nContext);
    const langContextValue = useMemo(
      () => ({ lang: entry.lang, setLang: noopSetLang }),
      [entry.lang],
    );

    useEffect(() => {
      form.reset();
    }, [entry.id]);

    const updateEntry = useCallback(
      async (data: Partial<Record<string, unknown>>) => {
        const errorOrPatch = parseFormData(data, entry.lang);
        if (typeof errorOrPatch === "string") return errorOrPatch;

        const nextRawResource = resourceUnionSchema.parse(
          applyResourceEditorPreviewPatch(entry.resource, errorOrPatch, translationFields),
        );
        printDeck.updateEntry(entry.id, { ...entry, resource: nextRawResource });

        return undefined;
      },
      [entry],
    );

    const [submit, saving] = useSubmit(updateEntry);
    const save = useCallback(async () => submit(), [submit]);
    const saveAndClose = useCallback(async () => {
      if (!(await submit())) onClose();
    }, [onClose, submit]);
    const valid = useValid();
    const error = useSubmitError();

    return (
      <ResourceDialog
        error={error}
        onClose={onClose}
        onCopyToClipboard={form.copyDataToClipboard}
        onPasteFromClipboard={form.pasteDataFromClipboard}
        onPrimaryAction={save}
        onSecondaryAction={saveAndClose}
        open
        preview={
          <i18nLangProviderContext.Provider value={langContextValue}>
            <PrintDeckEditorPreview
              entry={entry}
              localizeResource={localizeResource}
              parseFormData={parseFormData}
              translationFields={translationFields}
              useData={useData}
              useLocalizationContext={useLocalizationContext}
            />
          </i18nLangProviderContext.Provider>
        }
        primaryActionText={t("save")}
        saving={saving}
        secondaryActionText={t("save_and_close")}
        title={ti("title", translate(entry.resource.name, entry.lang))}
        valid={valid}
      >
        <Editor resource={entry.resource} sourceId={entry.resource.source_id} />
      </ResourceDialog>
    );
  }

  return PrintDeckResourceDialog;
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  save: {
    en: "Save",
    it: "Salva",
  },
  save_and_close: {
    en: "Save and close",
    it: "Salva e chiudi",
  },
  title: {
    en: 'Edit "<1>"',
    it: 'Modifica "<1>"',
  },
};
