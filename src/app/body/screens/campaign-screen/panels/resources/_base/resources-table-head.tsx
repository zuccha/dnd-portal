import { Table } from "@chakra-ui/react";
import { EyeIcon, type LucideIcon } from "lucide-react";
import { useCallback } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { type I18nString, translate } from "~/i18n/i18n-string";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource, ResourceFilters } from "~/models/resources/resource";
import type { ResourceStore } from "~/models/resources/resource-store";
import Checkbox from "~/ui/checkbox";
import Icon from "~/ui/icon";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resources Table Head Extra
//------------------------------------------------------------------------------

export type ResourcesTableHeadExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  columns: (Table.ColumnHeaderProps & {
    icon?: LucideIcon;
    key: keyof L;
    label: I18nString;
  })[];
};

//------------------------------------------------------------------------------
// Create Resources Table Head
//------------------------------------------------------------------------------

export type ResourcesTableHeadProps = {
  campaignId: string;
};

export function createResourcesTableHead<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  _context: ResourcesContext<R>,
  extra: ResourcesTableHeadExtra<R, L>,
) {
  return function ResourcesTableHead({ campaignId }: ResourcesTableHeadProps) {
    const [lang] = useI18nLang();
    const filteredResourceIds = store.useFilteredResourceIds(campaignId);
    const selectedResourcesCount = store.useResourceSelectionCount(campaignId);

    const selected =
      selectedResourcesCount === filteredResourceIds.length ? true
      : selectedResourcesCount > 0 ? "-"
      : false;

    const toggleSelected = useCallback(() => {
      if (selected === true) store.deselectAllResources(campaignId);
      else store.selectAllResources(campaignId);
    }, [campaignId, selected]);

    return (
      <Table.Row>
        <Table.ColumnHeader textAlign="center" w="4em">
          <Checkbox onClick={toggleSelected} size="sm" value={selected} />
        </Table.ColumnHeader>

        <Table.ColumnHeader textAlign="center" w="3em">
          <Icon Icon={EyeIcon} color="fg.muted" size="sm" />
        </Table.ColumnHeader>

        {extra.columns.map(({ icon, key, label, ...rest }) => {
          return (
            <Table.ColumnHeader
              key={String(key)}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              {...rest}
            >
              {icon ?
                <Icon Icon={icon} size="sm" />
              : translate(label, lang)}
            </Table.ColumnHeader>
          );
        })}
      </Table.Row>
    );
  };
}
