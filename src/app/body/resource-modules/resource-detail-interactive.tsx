import { EditIcon, PrinterIcon, SaveIcon } from "lucide-react";
import { useCallback } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useSourceEditable } from "~/models/catalogue/catalogue";
import { printDeck } from "~/models/print-deck/print-deck-store";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { resourceUnionSchema } from "~/models/resources/resource-union";
import { toaster } from "~/ui/toaster";
import type { ResourceDetailAction } from "./resource-detail";
import type { ResourcesContext } from "./resources-context";
import type { ResourceAction } from "./resources-table-row";
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
) {
  const { Detail } = detail;
  const actions = detail.actions ?? [];
  const { usePaletteName } = context;

  //------------------------------------------------------------------------------
  // Resource Detail Interactive
  //------------------------------------------------------------------------------

  return function ResourceDetailInteractive({ resource }: { resource: L | undefined }) {
    const { lang, t } = useI18nLangContext(i18nContext);
    const sourceEditable = useSourceEditable(resource?._raw.source_id ?? "");
    const paletteName = usePaletteName();

    const edit = useCallback(() => {
      if (resource && sourceEditable) context.setEditedResource(resource._raw);
    }, [resource, sourceEditable]);

    const addToPrintDeck = useCallback(() => {
      if (!resource) return;

      printDeck.addEntry({
        lang,
        palette_name: paletteName,
        resource: resourceUnionSchema.parse(resource._raw),
      });
      toaster.success({
        description: resource.name,
        title: t("print_deck.added"),
      });
    }, [lang, paletteName, resource, t]);

    const makePersistent = useCallback(async () => {
      if (!resource) return;

      const error = await store.setResourceTemporary(resource.id, false);
      if (error) {
        toaster.error({
          description: t("persistent.error.description"),
          title: t("persistent.error.title"),
        });
      } else {
        toaster.success({
          description: resource.name,
          title: t("persistent.done"),
        });
      }
    }, [resource, t]);

    if (!resource) return <Detail actions={[]} resource={undefined} />;

    const visibleActions = actions.filter(
      ({ isVisible }) => !isVisible || isVisible(resource._raw),
    );
    const resourceDetailActions: ResourceDetailAction[] = [
      ...(sourceEditable ? [{ Icon: EditIcon, label: t("edit"), onClick: edit }] : []),
      {
        Icon: PrinterIcon,
        label: t("print_deck.add"),
        onClick: addToPrintDeck,
      },
      ...(sourceEditable && resource._raw.virtual
        ? [{ Icon: SaveIcon, label: t("persistent.make"), onClick: () => void makePersistent() }]
        : []),
      ...(sourceEditable
        ? visibleActions.map((action) => ({
            Icon: action.icon,
            label: translate(action.label, lang),
            disabled: action.isDisabled?.(resource._raw) ?? false,
            onClick: () => {
              const disabled = action.isDisabled?.(resource._raw) ?? false;
              if (!disabled) void action.onClick(resource._raw);
            },
          }))
        : []),
    ];

    return <Detail actions={resourceDetailActions} resource={resource} />;
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
};
