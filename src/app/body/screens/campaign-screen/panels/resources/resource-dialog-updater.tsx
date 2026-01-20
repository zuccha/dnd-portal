import { useCallback } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import type { Form } from "~/utils/form";
import ResourceDialog from "./resource-dialog";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resource Dialog Updater Extra
//------------------------------------------------------------------------------

export type ResourceDialogUpdaterExtra<
  R extends Resource,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
  FF extends Record<string, unknown>,
> = {
  Editor: React.FC<{ campaignId: string; resource: R }>;
  form: Form<FF>;
  parseFormData: (
    data: Partial<FF>,
  ) => { resource: Partial<DBR>; translation: Partial<DBT> } | string;
};

//------------------------------------------------------------------------------
// Create Resource Dialog Updater
//------------------------------------------------------------------------------

export type ResourceDialogUpdaterProps = {
  campaignId: string;
};

export function createResourceDialogUpdater<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
  FF extends Record<string, unknown>,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  context: ResourcesContext<R>,
  { Editor, form, parseFormData }: ResourceDialogUpdaterExtra<R, DBR, DBT, FF>,
) {
  async function submitForm(
    data: Partial<FF>,
    { id, lang }: { id: string; lang: string },
  ) {
    const errorOrData = parseFormData(data);
    if (typeof errorOrData === "string") return errorOrData;

    const { resource, translation } = errorOrData;
    const response = await store.updateResource(id, lang, resource, translation)
      .promise;

    if (response.status === "failure") {
      console.error(response.error);
      return "form.error.update_failure";
    }

    return undefined;
  }

  return function ResourcesUpdater({ campaignId }: ResourceDialogUpdaterProps) {
    const { lang, t, ti } = useI18nLangContext(i18nContext);

    const editedResource = context.useEditedResource();
    const editedResourceId = editedResource?.id ?? "";

    const [submit, saving] = form.useSubmit(
      useCallback(
        (data) => submitForm(data, { id: editedResourceId, lang }),
        [editedResourceId, lang],
      ),
    );

    const unsetEditedResource = useCallback(() => {
      context.setEditedResource(undefined);
    }, []);

    const save = useCallback(async () => {
      await submit();
    }, [submit]);

    const saveAndClose = useCallback(async () => {
      if (!(await submit())) unsetEditedResource();
    }, [submit, unsetEditedResource]);

    const valid = form.useValid();
    const error = form.useSubmitError();

    const name = editedResource?.name[lang] ?? "";

    return (
      <ResourceDialog
        error={error}
        onClose={unsetEditedResource}
        onCopyToClipboard={form.copyDataToClipboard}
        onPasteFromClipboard={form.pasteDataFromClipboard}
        onPrimaryAction={save}
        onSecondaryAction={saveAndClose}
        open={!!editedResource}
        primaryActionText={t("save")}
        saving={saving}
        secondaryActionText={t("save_and_close")}
        title={name ? ti("title", name) : t("title.empty")}
        valid={valid}
      >
        <Editor
          campaignId={campaignId}
          resource={editedResource ?? store.defaultResource}
        />
      </ResourceDialog>
    );
  };
}

//------------------------------------------------------------------------------
// I18nContext
//------------------------------------------------------------------------------

const i18nContext = {
  "save": {
    en: "Save",
    it: "Salva",
  },
  "save_and_close": {
    en: "Save and close",
    it: "Salva e chiudi",
  },
  "title": {
    en: 'Edit "<1>"',
    it: 'Modifica "<1>"',
  },
  "title.empty": {
    en: "Edit resource",
    it: "Modifica risorsa",
  },
};
