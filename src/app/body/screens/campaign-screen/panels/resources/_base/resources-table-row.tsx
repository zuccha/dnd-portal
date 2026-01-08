import { Table, VStack } from "@chakra-ui/react";
import { EyeClosedIcon, EyeIcon, type LucideIcon } from "lucide-react";
import { useCallback } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { type I18nString, translate } from "~/i18n/i18n-string";
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
import Link from "~/ui/link";
import RichText from "~/ui/rich-text";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resources Table Row Extra
//------------------------------------------------------------------------------

export type ResourcesTableRowExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  columns: (Table.ColumnHeaderProps & {
    icon?: LucideIcon;
    key: keyof L;
    label: I18nString;
  })[];
  detailsKey?: keyof L;
};

//------------------------------------------------------------------------------
// Create Resources Table Row
//------------------------------------------------------------------------------

type ResourcesTableRowProps = {
  editable: boolean;
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
  const {
    useLocalizedResource,
    useResourceSelection,
    useResourceSelectionMethods,
  } = store;

  const { useResourceExpansion } = context;

  return function ResourcesTableRow({
    editable,
    resourceId,
  }: ResourcesTableRowProps) {
    const [lang] = useI18nLang();

    const localizedResource = useLocalizedResource(resourceId);
    const selected = useResourceSelection(resourceId);
    const { toggleResourceSelection } = useResourceSelectionMethods(resourceId);
    const expanded = useResourceExpansion(resourceId, false);

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
        e.stopPropagation();
        toggleResourceSelection();
      },
      [toggleResourceSelection],
    );

    if (!localizedResource) return null;

    const columnCount = extra.columns.length + (editable ? 2 : 1);

    return (
      <>
        <Table.Row
          onClick={() =>
            context.setResourceExpansion(resourceId, false, (prev) => !prev)
          }
        >
          <Table.Cell textAlign="center" w="4em">
            <Checkbox onClick={toggleSelection} size="sm" value={selected} />
          </Table.Cell>

          <Table.Cell textAlign="center" w="3em">
            <Icon
              Icon={
                localizedResource._raw.visibility === "player" ?
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
                  <Checkbox disabled size="sm" value={value} />
                : String(value) || "-"}
              </Table.Cell>
            );
          })}
        </Table.Row>

        {extra.detailsKey && expanded && (
          <Table.Row bgColor="bg.muted" w="full">
            <Table.Cell colSpan={columnCount}>
              <VStack align="flex-start" gap={1} w="full">
                {localizedResource[extra.detailsKey] ?
                  String(localizedResource[extra.detailsKey])
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
