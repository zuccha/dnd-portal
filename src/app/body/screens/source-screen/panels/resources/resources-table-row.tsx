import { Table, VStack, createIcon } from "@chakra-ui/react";
import { EyeClosedIcon, EyeIcon, type LucideIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { type I18nString, translate } from "~/i18n/i18n-string";
import { resolveSystemText, useI18nSystem } from "~/i18n/i18n-system";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import Checkbox from "~/ui/checkbox";
import Icon from "~/ui/icon";
import IconButton from "~/ui/icon-button";
import Link from "~/ui/link";
import RichText from "~/ui/rich-text";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resources Table Row Extra
//------------------------------------------------------------------------------

export type ResourceAction<R extends Resource> = {
  icon: LucideIcon | ReturnType<typeof createIcon>;
  isVisible: (resource: R) => boolean;
  label: I18nString;
  onClick: (resource: R) => void;
};

export type ResourcesTableRowExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  actions?: ResourceAction<R>[];
  columns: (Table.ColumnHeaderProps & {
    icon?: LucideIcon | ReturnType<typeof createIcon>;
    key: keyof L;
    label: I18nString;
  })[];
  detailsKey?: keyof L;
};

//------------------------------------------------------------------------------
// Create Resources Table Row
//------------------------------------------------------------------------------

type ResourcesTableRowProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  editable: boolean;
  localizeResource: (resource: R) => L;
  resourceId: string;
};

export function createResourcesTableRow<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  context: ResourcesContext<R>,
  extra: ResourcesTableRowExtra<R, L>,
) {
  const { useResource, useResourceSelection, useResourceSelectionMethods } =
    store;

  const { useResourceExpansion } = context;

  return function ResourcesTableRow({
    editable,
    localizeResource,
    resourceId,
  }: ResourcesTableRowProps<R, L>) {
    const [lang] = useI18nLang();
    const [system] = useI18nSystem();

    const [resource] = useResource(resourceId);
    const localizedResource = useMemo(
      () => localizeResource(resource),
      [localizeResource, resource],
    );
    const selected = useResourceSelection(resourceId);
    const { toggleResourceSelection } = useResourceSelectionMethods(resourceId);
    const expanded = useResourceExpansion(resourceId, false);
    const details =
      extra.detailsKey && localizedResource[extra.detailsKey] ?
        resolveSystemText(String(localizedResource[extra.detailsKey]), system)
      : "";

    const edit = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (localizedResource)
          context.setEditedResource(localizedResource._raw);
      },
      [localizedResource],
    );

    const toggleSelection = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleResourceSelection();
      },
      [toggleResourceSelection],
    );

    const hasActions = !!extra.actions?.length;
    const columnCount =
      extra.columns.length + (editable ? 2 : 1) + (hasActions ? 1 : 0);

    return (
      <>
        <Table.Row
          onClick={() =>
            context.setResourceExpansion(resourceId, false, (prev) => !prev)
          }
        >
          <Table.Cell textAlign="center" w="4em">
            <Checkbox
              mt={0.5}
              onClick={toggleSelection}
              size="sm"
              value={selected}
            />
          </Table.Cell>

          <Table.Cell textAlign="center" w="3em">
            <Icon
              Icon={
                localizedResource._raw.visibility === "public" ?
                  EyeIcon
                : EyeClosedIcon
              }
              color="fg.muted"
              size="sm"
            />
          </Table.Cell>

          {extra.columns.map(({ key, ...rest }) => {
            const value = localizedResource[key];
            return (
              <Table.Cell
                key={String(key)}
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                {...rest}
              >
                {key === "name" && editable ?
                  <Link onClick={edit}>{String(value)}</Link>
                : typeof value === "boolean" ?
                  <Checkbox disabled mt={0.5} size="sm" value={value} />
                : String(value) || "-"}
              </Table.Cell>
            );
          })}

          {!!extra.actions?.length && (
            <Table.Cell textAlign="center" w="1%">
              {extra.actions.map((action, i) => (
                <IconButton
                  Icon={action.icon}
                  aria-label={translate(action.label, lang)}
                  disabled={!action.isVisible(localizedResource._raw)}
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    action.onClick(localizedResource._raw);
                  }}
                  size="2xs"
                  variant="ghost"
                />
              ))}
            </Table.Cell>
          )}
        </Table.Row>

        {extra.detailsKey && expanded && (
          <Table.Row bgColor="bg.muted" w="full">
            <Table.Cell colSpan={columnCount}>
              <VStack align="flex-start" gap={1} w="full">
                {details ?
                  details
                    .split(/[\n\r]/)
                    .map((paragraph, i) => (
                      <RichText key={i} text={paragraph} />
                    ))
                : <RichText
                    text={translate(
                      { en: "_No details._", it: "_Nessuna descrizione._" },
                      lang,
                    )}
                  />
                }
              </VStack>
            </Table.Cell>
          </Table.Row>
        )}
      </>
    );
  };
}
