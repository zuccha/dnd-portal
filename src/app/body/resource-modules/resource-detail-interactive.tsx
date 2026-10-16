import { EditIcon, PrinterIcon, SaveIcon, Trash2Icon } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useSourceEditable } from "~/models/catalogue/catalogue";
import { printDeck } from "~/models/print-deck/print-deck-store";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { localizedResourceUnionSchema } from "~/models/resources/resource-union";
import { toaster } from "~/ui/toaster";
import { nilUuid } from "~/utils/uuid";
import { useResourceDelete } from "./resource-delete";
import type { ResourceAction } from "./resource-action";
import type { ResourceDetailAction } from "./resource-detail";
import type { ResourcesContext } from "./resources-context";
import type { ComponentType } from "react";

//------------------------------------------------------------------------------
// Create Resource Detail Interactive
//------------------------------------------------------------------------------

export function createResourceDetailInteractive<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
>(
  store: ResourceStore<R, L, F>,
  context: ResourcesContext<R>,
  detail: {
    Detail: ComponentType<{ actions?: ResourceDetailAction[]; resource: L | undefined }>;
    actions?: ResourceAction<R>[];
  },
  listPath: string,
) {
  const { Detail } = detail;
  const actions = detail.actions ?? [];
  const { usePaletteName } = context;

  //------------------------------------------------------------------------------
  // Resource Detail Interactive
  //------------------------------------------------------------------------------

  return function ResourceDetailInteractive({
    localizedResource,
    resource,
  }: {
    localizedResource: L | undefined;
    resource: R | undefined;
  }) {
    const { lang, t } = useI18nLangContext(i18nContext);
    const navigate = useNavigate();
    const sourceEditable = useSourceEditable(resource?.source_id ?? nilUuid);
    const paletteName = usePaletteName();
    const deleteResource = useResourceDelete(
      store,
      resource,
      localizedResource?.name ?? "",
      sourceEditable,
      () => navigate(listPath, { replace: true }),
    );

    const edit = useCallback(() => {
      if (resource && sourceEditable) context.setEditedResource(resource);
    }, [resource, sourceEditable]);

    const addToPrintDeck = useCallback(() => {
      if (!resource || !localizedResource) return;

      printDeck.addEntry({
        lang,
        palette_name: paletteName,
        resource: localizedResourceUnionSchema.parse(localizedResource),
      });
      toaster.success({
        description: localizedResource.name,
        title: t("print_deck.added"),
      });
    }, [lang, localizedResource, paletteName, resource, t]);

    const makePersistent = useCallback(async () => {
      if (!resource || !localizedResource) return;

      const error = await store.setResourceTemporary(resource.id, false);
      if (error) {
        toaster.error({
          description: t("persistent.error.description"),
          title: t("persistent.error.title"),
        });
      } else {
        toaster.success({
          description: localizedResource.name,
          title: t("persistent.done"),
        });
      }
    }, [localizedResource, resource, t]);

    if (!localizedResource || !resource) return <Detail actions={[]} resource={undefined} />;

    const visibleActions = actions.filter(({ isVisible }) => !isVisible || isVisible(resource));
    const resourceDetailActions: ResourceDetailAction[] = [
      ...(sourceEditable ? [{ Icon: EditIcon, label: t("edit"), onClick: edit }] : []),
      {
        Icon: PrinterIcon,
        label: t("print_deck.add"),
        onClick: addToPrintDeck,
      },
      ...(sourceEditable && resource.virtual
        ? [{ Icon: SaveIcon, label: t("persistent.make"), onClick: () => void makePersistent() }]
        : []),
      ...(sourceEditable
        ? visibleActions.map((action) => ({
            Icon: action.icon,
            label: translate(action.label, lang),
            disabled: action.isDisabled?.(resource) ?? false,
            onClick: () => {
              const disabled = action.isDisabled?.(resource) ?? false;
              if (resource && !disabled) void action.onClick(resource);
            },
          }))
        : []),
      ...(sourceEditable
        ? [
            {
              colorPalette: "red" as const,
              Icon: Trash2Icon,
              label: t("remove"),
              onClick: deleteResource.requestDelete,
            },
          ]
        : []),
    ];

    return (
      <>
        <Detail actions={resourceDetailActions} resource={localizedResource} />
        {deleteResource.dialog}
      </>
    );
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "edit": {
    en: "Edit",
    it: "Modifica",
  },
  "persistent.done": {
    en: "Resource made persistent",
    it: "Risorsa resa persistente",
  },
  "persistent.error.description": {
    en: "The resource could not be made persistent.",
    it: "La risorsa non può essere resa persistente.",
  },
  "persistent.error.title": {
    en: "Persistence failed",
    it: "Persistenza fallita",
  },
  "persistent.make": {
    en: "Make persistent",
    it: "Rendi persistente",
  },
  "print_deck.add": {
    en: "Add to print deck",
    it: "Prepara per la stampa",
  },
  "print_deck.added": {
    en: "Added to print deck",
    it: "Aggiunto al mazzo di stampa",
  },
  "remove": {
    en: "Delete",
    it: "Elimina",
  },
};
