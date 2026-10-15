import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { i18nLangProviderContext } from "~/i18n/i18n-lang-provider-context";
import { translate } from "~/i18n/i18n-string";
import type { PrintDeckEntry } from "~/models/print-deck/print-deck-entry";
import { printDeck } from "~/models/print-deck/print-deck-store";
import type { TranslationFields } from "~/models/resources/resource";
import { splitResourceFormOutput } from "~/models/resources/resource-form";
import type { LocalizedResourceUnion, ResourceUnion } from "~/models/resources/resource-union";
import { resourceUnionSchema } from "~/models/resources/resource-union";
import { toaster } from "~/ui/toaster";
import { type Form } from "~/utils/form";
import ResourceDialog from "../../../../resource-modules/resource-dialog";
import {
  applyResourceEditorPaste,
  applyResourceEditorPreviewPatch,
} from "../../../../resource-modules/resource-editor-preview";
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
    const [editorLang, setEditorLang] = useState(entry.lang);
    const formData = useData();
    const [editorResource, setEditorResource] = useState(entry.resource);
    const [editorRevision, setEditorRevision] = useState(0);
    const langContextValue = useMemo(
      () => ({ lang: editorLang, setLang: noopSetLang }),
      [editorLang],
    );

    useEffect(() => {
      form.reset();
      setEditorLang(entry.lang);
      setEditorResource(entry.resource);
    }, [entry.id, entry.lang, entry.resource]);

    const changeEditorLang = useCallback(
      (nextLang: string) => {
        const errorOrPatch = parseFormData(formData, editorLang);
        if (typeof errorOrPatch !== "string") {
          const { resource: resourcePatch } = splitResourceFormOutput(errorOrPatch);
          setEditorResource((current) =>
            resourceUnionSchema.parse(
              applyResourceEditorPreviewPatch(current, resourcePatch, translationFields),
            ),
          );
        }
        setEditorLang(nextLang);
      },
      [editorLang, formData],
    );

    const copyResourceToClipboard = useCallback(async () => {
      const errorOrPatch = parseFormData(formData, editorLang);
      const draftResource =
        typeof errorOrPatch === "string"
          ? editorResource
          : resourceUnionSchema.parse(
              applyResourceEditorPreviewPatch(
                editorResource,
                splitResourceFormOutput(errorOrPatch).resource,
                translationFields,
              ),
            );
      await navigator.clipboard.writeText(JSON.stringify(draftResource, null, 2));
    }, [editorLang, editorResource, formData]);

    const pasteResourceFromClipboard = useCallback(async () => {
      try {
        const pastedResource = resourceUnionSchema.parse(
          JSON.parse(await navigator.clipboard.readText()),
        );
        if (pastedResource.kind !== editorResource.kind) {
          toaster.error({
            description: t("paste_incompatible"),
            title: t("paste_error"),
          });
          return;
        }
        setEditorResource(
          applyResourceEditorPaste(editorResource, pastedResource, Object.keys(formData)),
        );
        setEditorRevision((revision) => revision + 1);
      } catch {
        toaster.error({
          description: t("paste_invalid"),
          title: t("paste_error"),
        });
      }
    }, [editorResource, formData, t]);

    const updateEntry = useCallback(
      async (data: Partial<Record<string, unknown>>) => {
        const errorOrPatch = parseFormData(data, editorLang);
        if (typeof errorOrPatch === "string") return errorOrPatch;

        const nextRawResource = resourceUnionSchema.parse(
          applyResourceEditorPreviewPatch(
            editorResource,
            splitResourceFormOutput(errorOrPatch).resource,
            translationFields,
          ),
        );
        printDeck.updateEntry(entry.id, { ...entry, resource: nextRawResource });

        return undefined;
      },
      [editorLang, editorResource, entry],
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
        editorLang={editorLang}
        error={error}
        onClose={onClose}
        onEditorLangChange={changeEditorLang}
        onCopyToClipboard={copyResourceToClipboard}
        onPasteFromClipboard={pasteResourceFromClipboard}
        onPrimaryAction={save}
        onSecondaryAction={saveAndClose}
        open
        preview={
          <i18nLangProviderContext.Provider value={langContextValue}>
            <PrintDeckEditorPreview
              entry={{ ...entry, resource: editorResource }}
              editorLang={editorLang}
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
        title={ti("title", translate(editorResource.name, entry.lang))}
        valid={valid}
      >
        <Editor
          key={`${entry.id}:${editorLang}:${editorRevision}`}
          resource={editorResource}
          sourceId={entry.resource.source_id}
        />
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
  paste_error: {
    en: "Unable to paste resource",
    it: "Impossibile incollare la risorsa",
  },
  paste_incompatible: {
    en: "The copied resource has a different type.",
    it: "La risorsa copiata è di un tipo diverso.",
  },
  paste_invalid: {
    en: "The clipboard content is not a valid resource.",
    it: "Il contenuto degli appunti non è una risorsa valida.",
  },
};
