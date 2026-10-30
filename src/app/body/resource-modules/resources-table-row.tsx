import { Badge, Box, HStack, Table, VStack, createIcon } from "@chakra-ui/react";
import {
  EditIcon,
  EyeClosedIcon,
  EyeIcon,
  Trash2Icon,
  type LucideIcon,
  PrinterIcon,
  SaveIcon,
} from "lucide-react";
import { Fragment, useCallback } from "react";
import { useNavigate } from "react-router";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { type I18nString, translate } from "~/i18n/i18n-string";
import { resolveSystemText, useI18nSystem } from "~/i18n/i18n-system";
import { useSourceEditable } from "~/models/catalogue/catalogue";
import { printDeck } from "~/models/print-deck/print-deck-store";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { localizedResourceUnionSchema } from "~/models/resources/resource-union";
import Checkbox from "~/ui/checkbox";
import Icon from "~/ui/icon";
import IconButton from "~/ui/icon-button";
import Link from "~/ui/link";
import RichText from "~/ui/rich-text";
import { renderRichTextBlocks } from "~/ui/rich-text-block-pattern";
import { italic } from "~/ui/rich-text-page";
import { richTextPageBreakBlockPattern } from "~/ui/rich-text-page-break";
import { createRichTextTableBlockPattern } from "~/ui/rich-text-table-block-pattern";
import { toaster } from "~/ui/toaster";
import { useResourceDelete } from "./resource-delete";
import { useResourceLinkPatterns } from "./resource-link-pattern";
import type { ResourceAction } from "./resource-action";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resources Table Row Extra
//------------------------------------------------------------------------------

export type ResourcesTableRowExtra<R extends Resource, L extends LocalizedResource<R>> = {
  actions?: ResourceAction<R>[];
  columns: (Table.ColumnHeaderProps & {
    icon?: LucideIcon | ReturnType<typeof createIcon>;
    key: keyof L;
    label: I18nString;
  })[];
  hasDescription?: boolean;
  path: string;
};

//------------------------------------------------------------------------------
// Create Resources Table Row
//------------------------------------------------------------------------------

type ResourcesTableRowProps = {
  resourceId: string;
  resourceReferences: Resource[];
};

export function createResourcesTableRow<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
>(
  store: ResourceStore<R, L, F>,
  context: ResourcesContext<R>,
  extra: ResourcesTableRowExtra<R, L>,
) {
  const { setResourceSelection, useLocalizedResource, useResource, useResourceSelection } = store;

  const { usePaletteName, useResourceExpansion } = context;

  function ResourcesTableRow({ resourceId, resourceReferences }: ResourcesTableRowProps) {
    const resource = useResource(resourceId);
    const localizedResource = useLocalizedResource(resourceId);
    if (!resource || !localizedResource) return null;

    return (
      <ResourcesTableRowContent
        localizedResource={localizedResource}
        resource={resource}
        resourceReferences={resourceReferences}
      />
    );
  }

  //------------------------------------------------------------------------------
  // Resources Table Row Content
  //------------------------------------------------------------------------------

  function ResourcesTableRowContent({
    localizedResource,
    resource,
    resourceReferences,
  }: Omit<ResourcesTableRowProps, "resourceId"> & {
    localizedResource: L;
    resource: R;
  }) {
    const { lang, t } = useI18nLangContext(i18nContext);
    const [system] = useI18nSystem();
    const richTextPatterns = useResourceLinkPatterns(resourceReferences);
    const navigate = useNavigate();

    const sourceEditable = useSourceEditable(resource.source_id);
    const paletteName = usePaletteName();
    const selected = useResourceSelection(resource.id);
    const expanded = useResourceExpansion(resource.id, false);
    const deleteResource = useResourceDelete(
      store,
      resource,
      localizedResource.name,
      sourceEditable,
    );
    const description =
      extra.hasDescription && localizedResource.description
        ? resolveSystemText(String(localizedResource.description), system)
        : "";
    const descriptionBlocks = renderRichTextBlocks(description, [
      richTextPageBreakBlockPattern,
      createRichTextTableBlockPattern({
        mode: "grid",
        renderCell: (value) => (
          <RichText
            display="inline"
            overflowWrap="normal"
            patterns={richTextPatterns}
            text={value}
            whiteSpace="normal"
          />
        ),
      }),
    ]);
    const visibleActions = extra.actions?.filter((action) => action.isVisible(resource)) ?? [];

    const edit = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!sourceEditable) return;
        context.setEditedResource(resource);
      },
      [resource, sourceEditable],
    );

    const openDetails = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`${extra.path}/${encodeURIComponent(resource.id)}`);
      },
      [navigate, resource.id],
    );

    const addToPrintDeck = useCallback(() => {
      printDeck.addEntry({
        lang,
        palette_name: paletteName,
        resource: localizedResourceUnionSchema.parse(localizedResource),
      });

      toaster.success({
        description: localizedResource.name,
        title: t("print_deck.added"),
      });
    }, [lang, localizedResource, paletteName, t]);

    const makePersistent = useCallback(async () => {
      const error = await store.setResourceTemporary(localizedResource.id, false);
      return error
        ? toaster.error({
            description: t("persistent.error.description"),
            title: t("persistent.error.title"),
          })
        : toaster.success({
            description: localizedResource.name,
            title: t("persistent.done"),
          });
    }, [localizedResource.id, localizedResource.name, t]);

    const setSelection = useCallback(
      (selected: boolean) => setResourceSelection(resource.id, selected),
      [resource.id],
    );

    const toggleExpansion = useCallback(() => {
      if (!extra.hasDescription) return;
      context.setResourceExpansion(resource.id, false, (prev) => !prev);
    }, [resource.id]);

    const hasActions = true;
    const columnCount = extra.columns.length + 3;

    return (
      <>
        <Table.Row cursor={extra.hasDescription ? "pointer" : undefined} onClick={toggleExpansion}>
          <Table.Cell textAlign="center" w="4em">
            <Checkbox
              mt={0.5}
              onClick={(e) => e.stopPropagation()}
              onValueChange={setSelection}
              size="sm"
              value={selected}
            />
          </Table.Cell>

          <Table.Cell textAlign="center" w="3em">
            <Icon
              Icon={localizedResource.visibility === "public" ? EyeIcon : EyeClosedIcon}
              color="fg.muted"
              size="sm"
            />
          </Table.Cell>

          {extra.columns.map(({ key, ...rest }) => {
            const value = localizedResource[key];
            const displayValue =
              value &&
              typeof value === "object" &&
              "value" in value &&
              typeof value.value === "string"
                ? value.value
                : value;
            return (
              <Table.Cell
                key={String(key)}
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                {...rest}
              >
                {key === "name" ? (
                  <HStack gap={2} minW={0}>
                    {localizedResource.is_virtual && (
                      <Badge colorPalette="orange" size="xs" variant="solid">
                        {t("temporary")}
                      </Badge>
                    )}
                    <Link onClick={openDetails}>{String(value)}</Link>
                  </HStack>
                ) : typeof displayValue === "boolean" ? (
                  <Checkbox disabled mt={0.5} size="sm" value={displayValue} />
                ) : (
                  String(displayValue) || "-"
                )}
              </Table.Cell>
            );
          })}

          {hasActions && (
            <Table.Cell textAlign="center" w="1%" whiteSpace="nowrap">
              <HStack gap={0} justify="center">
                {sourceEditable && (
                  <IconButton
                    Icon={EditIcon}
                    label={t("edit")}
                    onClick={edit}
                    size="2xs"
                    variant="ghost"
                  />
                )}

                <IconButton
                  Icon={PrinterIcon}
                  label={t("print_deck.add")}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToPrintDeck();
                  }}
                  size="2xs"
                  variant="ghost"
                />

                {sourceEditable && localizedResource.is_virtual && (
                  <IconButton
                    Icon={SaveIcon}
                    label={t("persistent.make")}
                    onClick={(e) => {
                      e.stopPropagation();
                      void makePersistent();
                    }}
                    size="2xs"
                    variant="ghost"
                  />
                )}

                {sourceEditable &&
                  visibleActions.map((action, i) => {
                    const ActionIcon = action.icon;
                    const disabled = action.isDisabled?.(resource) ?? false;
                    return (
                      <IconButton
                        Icon={ActionIcon}
                        disabled={disabled}
                        key={i}
                        label={translate(action.label, lang)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!disabled) void action.onClick(resource);
                        }}
                        size="2xs"
                        variant="ghost"
                      />
                    );
                  })}

                {sourceEditable && (
                  <IconButton
                    Icon={Trash2Icon}
                    colorPalette="red"
                    label={t("remove")}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteResource.requestDelete();
                    }}
                    size="2xs"
                    variant="ghost"
                  />
                )}
              </HStack>
            </Table.Cell>
          )}
        </Table.Row>

        {extra.hasDescription && expanded && (
          <Table.Row bgColor="bg.muted" w="full">
            <Table.Cell colSpan={columnCount}>
              <Box contain="inline-size" w="full">
                <VStack align="flex-start" gap={1} minW={0} w="full">
                  {description ? (
                    descriptionBlocks.flatMap((block, blockIndex) =>
                      block.type === "rendered" ? (
                        <Fragment key={blockIndex}>{block.value}</Fragment>
                      ) : (
                        block.value
                          .split(/[\n\r]/)
                          .map((paragraph, paragraphIndex) => (
                            <RichText
                              display="block"
                              key={`${blockIndex}:${paragraphIndex}`}
                              overflowWrap="anywhere"
                              patterns={richTextPatterns}
                              text={paragraph}
                              whiteSpace="normal"
                            />
                          ))
                      ),
                    )
                  ) : (
                    <RichText
                      display="block"
                      overflowWrap="anywhere"
                      patterns={richTextPatterns}
                      text={t("description.missing")}
                      whiteSpace="normal"
                    />
                  )}
                </VStack>
              </Box>
            </Table.Cell>
          </Table.Row>
        )}
        {deleteResource.dialog}
      </>
    );
  }

  return ResourcesTableRow;
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "actions": {
    en: "Actions",
    it: "Azioni",
  },
  "description.missing": {
    en: italic("No details."),
    it: italic("Nessuna descrizione."),
  },
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
    it: "Aggiungi al mazzo di stampa",
  },
  "print_deck.added": {
    en: "Added to print deck",
    it: "Aggiunto al mazzo di stampa",
  },
  "remove": {
    en: "Delete",
    it: "Elimina",
  },
  "temporary": {
    en: "Temporary",
    it: "Temporanea",
  },
};
