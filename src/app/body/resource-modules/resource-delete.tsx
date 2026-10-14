import { useCallback, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import ConfirmationDialog from "~/ui/confirmation-dialog";
import { toaster } from "~/ui/toaster";

//------------------------------------------------------------------------------
// Use Resource Delete
//------------------------------------------------------------------------------

export function useResourceDelete<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
>(
  store: ResourceStore<R, L, F>,
  resource: R | undefined,
  resourceName: string,
  canDelete: boolean,
  onDeleted?: () => void,
) {
  const { t } = useI18nLangContext(i18nContext);
  const [open, setOpen] = useState(false);

  const requestDelete = useCallback(() => {
    if (canDelete) setOpen(true);
  }, [canDelete]);

  const cancel = useCallback(() => setOpen(false), []);

  const confirm = useCallback(async () => {
    if (!canDelete || !resource) return;

    const error = await store.deleteResources([resource.id]);
    if (error) {
      toaster.error({ description: t("remove.error.description"), title: t("remove.error.title") });
      return;
    }

    setOpen(false);
    toaster.success({ description: resourceName, title: t("remove.done") });
    onDeleted?.();
  }, [canDelete, onDeleted, resource, resourceName, store, t]);

  const dialog = (
    <ConfirmationDialog
      cancelText={t("cancel")}
      confirmText={t("remove.confirm_action")}
      description={t("remove.confirm_description")}
      onCancel={cancel}
      onConfirm={confirm}
      open={open}
      title={t("remove.confirm_title")}
    />
  );

  return { dialog, requestDelete };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "cancel": {
    en: "Cancel",
    it: "Annulla",
  },
  "remove.confirm_action": {
    en: "Delete",
    it: "Elimina",
  },
  "remove.confirm_description": {
    en: "Are you sure you want to delete this resource? This action cannot be undone.",
    it: "Vuoi eliminare questa risorsa? L'azione non può essere annullata.",
  },
  "remove.confirm_title": {
    en: "Delete resource?",
    it: "Eliminare la risorsa?",
  },
  "remove.done": {
    en: "Resource deleted",
    it: "Risorsa eliminata",
  },
  "remove.error.description": {
    en: "The resource could not be deleted.",
    it: "Non è stato possibile eliminare la risorsa.",
  },
  "remove.error.title": {
    en: "Delete failed",
    it: "Eliminazione non riuscita",
  },
};
