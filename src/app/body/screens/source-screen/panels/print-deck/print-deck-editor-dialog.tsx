import { useCallback, useEffect } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import {
  type PrintDeckEntry,
  printDeck,
} from "~/models/print-deck/print-deck-store";
import { resourceUnionSchema } from "~/models/resources/resource-union";
import { palettes } from "~/utils/palette";
import ResourceCardPreview from "../resources/resource-card-preview";
import ResourceDialog from "../resources/resource-dialog";
import {
  type PrintDeckEditorPatch,
  getPrintDeckEditorRegistryEntry,
} from "./print-deck-editor-registry";
import { getPrintDeckRegistryEntry } from "./print-deck-registry";

//------------------------------------------------------------------------------
// Print Deck Editor Dialog Props
//------------------------------------------------------------------------------

export type PrintDeckEditorDialogProps = {
  entry: PrintDeckEntry | undefined;
  onClose: () => void;
};

//------------------------------------------------------------------------------
// Print Deck Editor Dialog
//------------------------------------------------------------------------------

export default function PrintDeckEditorDialog({
  entry,
  onClose,
}: PrintDeckEditorDialogProps) {
  if (!entry) {
    return null;
  }

  return <PrintDeckEditorDialogLoaded entry={entry} onClose={onClose} />;
}

//------------------------------------------------------------------------------
// Print Deck Editor Dialog Loaded
//------------------------------------------------------------------------------

function PrintDeckEditorDialogLoaded({
  entry,
  onClose,
}: {
  entry: PrintDeckEntry;
  onClose: () => void;
}) {
  const registryEntry = getPrintDeckEditorRegistryEntry(
    entry.localized_resource.kind,
  );
  if (!registryEntry)
    throw new Error("Missing print deck editor registry entry");

  const { t, ti } = useI18nLangContext(i18nContext);
  const localizeResource = registryEntry.useLocalizeResource(
    entry.localized_resource._raw.source_id,
  );
  const { Card } = getPrintDeckRegistryEntry(entry.localized_resource.kind);
  const { Editor, form, parseFormData } = registryEntry;

  useEffect(() => {
    form.reset();
  }, [entry.id, form]);

  const updateEntry = useCallback(
    async (data: Partial<Record<string, unknown>>) => {
      const errorOrPatch = parseFormData(data);
      if (typeof errorOrPatch === "string") return errorOrPatch;

      const nextRawResource = resourceUnionSchema.parse(
        applyPrintDeckEditorPatch(
          entry.localized_resource._raw,
          entry.lang,
          errorOrPatch,
        ),
      );
      const nextLocalizedResource = localizeResource(nextRawResource);

      printDeck.updateEntry(entry.id, {
        ...entry,
        localized_resource: nextLocalizedResource,
      });

      return undefined;
    },
    [entry, localizeResource, parseFormData],
  );

  const [submit, saving] = form.useSubmit(updateEntry);

  const save = useCallback(async () => {
    await submit();
  }, [submit]);

  const saveAndClose = useCallback(async () => {
    if (!(await submit())) onClose();
  }, [onClose, submit]);

  const valid = form.useValid();
  const error = form.useSubmitError();

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
        <ResourceCardPreview
          Card={Card}
          localizedResource={entry.localized_resource}
          palette={palettes[entry.palette_name]}
          showImage
        />
      }
      primaryActionText={t("save")}
      saving={saving}
      secondaryActionText={t("save_and_close")}
      title={ti("title", entry.localized_resource.name)}
      valid={valid}
    >
      <Editor
        resource={entry.localized_resource._raw}
        sourceId={entry.localized_resource._raw.source_id}
      />
    </ResourceDialog>
  );
}

//------------------------------------------------------------------------------
// Apply Print Deck Editor Patch
//------------------------------------------------------------------------------

function applyPrintDeckEditorPatch(
  resource: PrintDeckEntry["localized_resource"]["_raw"],
  lang: string,
  patch: PrintDeckEditorPatch,
) {
  const nextResource: Record<string, unknown> = structuredClone(resource);

  for (const [key, value] of Object.entries(patch.resource)) {
    if (value !== undefined) nextResource[key] = value;
  }

  for (const [key, value] of Object.entries(patch.translation)) {
    if (value === undefined) continue;

    const previous = nextResource[key];
    const translations =
      previous && typeof previous === "object" && !Array.isArray(previous) ?
        { ...(previous as Record<string, unknown>) }
      : {};

    translations[lang] = value;
    nextResource[key] = translations;
  }

  return nextResource;
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
