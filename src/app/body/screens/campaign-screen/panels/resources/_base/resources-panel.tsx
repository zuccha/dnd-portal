import { Flex, HStack, Separator, VStack } from "@chakra-ui/react";
import { Grid2X2Icon, ListIcon } from "lucide-react";
import { useCallback } from "react";
import z from "zod";
import { useI18nLang } from "~/i18n/i18n-lang";
import type { I18nString } from "~/i18n/i18n-string";
import { useCanEditCampaign } from "~/models/campaign";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource, ResourceFilters } from "~/models/resources/resource";
import type { ResourcesStore } from "~/models/resources/resources-store";
import { createLocalStore } from "~/store/local-store";
import { createMemoryStore } from "~/store/memory-store";
import BinaryButton, { type BinaryButtonProps } from "~/ui/binary-button";
import { report } from "~/utils/error";
import type { Form } from "~/utils/form";
import ResourceCreator from "./resource-creator";
import ResourceEditor from "./resource-editor";
import ResourcesActions from "./resources-actions";
import ResourcesCounter from "./resources-counter";
import ResourcesListCards from "./resources-list-cards";
import ResourcesListTable, {
  type ResourcesListTableColumn,
} from "./resources-list-table";
import ResourcesModulesFilter from "./resources-modules-filter";

//------------------------------------------------------------------------------
// Create Resources Panel
//------------------------------------------------------------------------------

export type ResourcesPanelProps = {
  campaignId: string;
};

export function createResourcesPanel<
  R extends Resource,
  F extends ResourceFilters,
  L extends LocalizedResource<R>,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
  FF extends Record<string, unknown>,
>({
  Card,
  EditorContent,
  Filters,
  defaultResource,
  form,
  listTableColumns,
  listTableDescriptionKey,
  name,
  parseFormData,
  store,
}: {
  Card: React.FC<{
    canEdit: boolean;
    localizedResource: L;
    onOpen: (resource: R) => void;
  }>;
  EditorContent: React.FC<{ resource: R }>;
  Filters: React.FC;
  defaultResource: R;
  form: Form<FF>;
  listTableColumns: ResourcesListTableColumn<R, L>[];
  listTableDescriptionKey: keyof L;
  name: I18nString;
  parseFormData: (
    data: Partial<FF>,
  ) => { resource: Partial<DBR>; translation: Partial<DBT> } | string;
  store: ResourcesStore<R, F, L, DBR, DBT>;
}) {
  //----------------------------------------------------------------------------
  // Context - View
  //----------------------------------------------------------------------------

  const useView = createLocalStore(
    "resources.view",
    "table",
    z.enum(["cards", "table"]).parse,
  ).use;

  const viewOptions: BinaryButtonProps<"table", "cards">["options"] = [
    { Icon: ListIcon, value: "table" },
    { Icon: Grid2X2Icon, value: "cards" },
  ];

  //----------------------------------------------------------------------------
  // Context - Created Resource
  //----------------------------------------------------------------------------

  const createdResourceStore = createMemoryStore<R | undefined>(undefined);

  const unsetCreatedResource = () => createdResourceStore.set(undefined);
  const setCreatedResource = () => createdResourceStore.set(defaultResource);

  //----------------------------------------------------------------------------
  // Context - Edited Resource
  //----------------------------------------------------------------------------

  const editedResourceStore = createMemoryStore<R | undefined>(undefined);

  const unsetEditedResource = () => editedResourceStore.set(undefined);

  //----------------------------------------------------------------------------
  // Resource Creator Form
  //----------------------------------------------------------------------------

  async function submitCreatorForm(
    campaignId: string,
    data: Partial<FF>,
    { lang }: { lang: string },
  ) {
    const errorOrData = parseFormData(data);
    if (typeof errorOrData === "string") return errorOrData;

    const { resource, translation } = errorOrData;
    const response = await store.create(
      campaignId,
      lang,
      resource,
      translation,
    );
    if (response.error)
      return report(response.error, "form.error.creation_failure");

    return undefined;
  }

  function ResourceCreatorForm({ campaignId }: { campaignId: string }) {
    const [lang] = useI18nLang();

    const createdResource = createdResourceStore.useValue();

    const [submit, saving] = form.useSubmit(
      useCallback(
        (data) => submitCreatorForm(campaignId, data, { lang }),
        [campaignId, lang],
      ),
    );

    const valid = form.useValid();

    return (
      <ResourceCreator
        onClose={unsetCreatedResource}
        onReset={form.reset}
        onSubmit={submit}
        open={!!createdResource}
        saving={saving}
        valid={valid}
      >
        <EditorContent resource={createdResource ?? defaultResource} />
      </ResourceCreator>
    );
  }

  //----------------------------------------------------------------------------
  // Resource Editor Form
  //----------------------------------------------------------------------------

  async function submitEditorForm(
    data: Partial<FF>,
    { id, lang }: { id: string; lang: string },
  ) {
    const errorOrData = parseFormData(data);
    if (typeof errorOrData === "string") return errorOrData;

    const { resource, translation } = errorOrData;
    const response = await store.update(id, lang, resource, translation);
    if (response.error)
      return report(response.error, "form.error.update_failure");

    return undefined;
  }

  function ResourceEditorForm() {
    const [lang] = useI18nLang();

    const editedResource = editedResourceStore.useValue();
    const editedResourceId = editedResource?.id ?? "";

    const [submit, saving] = form.useSubmit(
      useCallback(
        (data) => submitEditorForm(data, { id: editedResourceId, lang }),
        [editedResourceId, lang],
      ),
    );

    const valid = form.useValid();
    const error = form.useSubmitError();

    return (
      <ResourceEditor
        error={error}
        name={editedResource?.name[lang] ?? ""}
        onClose={unsetEditedResource}
        onCopyToClipboard={form.copyDataToClipboard}
        onPasteFromClipboard={form.pasteDataFromClipboard}
        onSubmit={submit}
        open={!!editedResource}
        saving={saving}
        valid={valid}
      >
        <EditorContent resource={editedResource ?? defaultResource} />
      </ResourceEditor>
    );
  }

  //----------------------------------------------------------------------------
  // Resources Panel
  //----------------------------------------------------------------------------

  return function ResourcesPanel({ campaignId }: ResourcesPanelProps) {
    const [view, setView] = useView();
    const canEdit = useCanEditCampaign(campaignId);

    const [localizedResources] = store.useLocalizedFromCampaign(campaignId);
    const [selectedLocalizedResources] =
      store.useSelectedLocalizedFromCampaign(campaignId);

    const ResourcesListTableHeader = useCallback(() => {
      const [selectedLocalizedResources] =
        store.useSelectedLocalizedFromCampaign(campaignId);
      return (
        <ResourcesListTable.Header
          columns={listTableColumns}
          localizedResources={localizedResources}
          onDeselect={store.deselect}
          onSelect={store.select}
          selectedLocalizedResourcesCount={selectedLocalizedResources.length}
        />
      );
    }, [campaignId, localizedResources]);

    const ResourceListTableRow = useCallback(
      ({ localizedResource }: { localizedResource: L }) => {
        const [selected, { toggle }] = store.useIsSelected(
          localizedResource.id,
        );
        return (
          <ResourcesListTable.Row
            canEdit={canEdit}
            columns={listTableColumns}
            descriptionKey={listTableDescriptionKey}
            localizedResource={localizedResource}
            onOpen={editedResourceStore.set}
            onToggleSelected={toggle}
            selected={selected}
          />
        );
      },
      [canEdit],
    );

    return (
      <VStack flex={1} gap={0} h="full" overflow="auto" w="full">
        <HStack
          borderBottomWidth={1}
          gap={4}
          h="4em"
          justify="space-between"
          overflow="auto"
          p={2}
          w="full"
        >
          <HStack>
            <ResourcesActions
              canEdit={canEdit}
              name={name}
              onAddNew={setCreatedResource}
              onRemove={store.remove}
              selectedLocalizedResources={selectedLocalizedResources}
            />
            <ResourcesModulesFilter />
            <Filters />
            <Separator h="1.5em" orientation="vertical" />
            <ResourcesCounter count={localizedResources.length} />
          </HStack>

          <HStack>
            <BinaryButton
              onValueChange={setView}
              options={viewOptions}
              value={view}
            />
          </HStack>
        </HStack>

        <Flex flex={1} overflow="auto" w="full">
          {view === "table" && (
            <ResourcesListTable
              Header={ResourcesListTableHeader}
              Row={ResourceListTableRow}
              localizedResources={localizedResources}
            />
          )}

          {view === "cards" && (
            <ResourcesListCards
              Card={Card}
              canEdit={canEdit}
              localizedResources={localizedResources}
              onOpen={editedResourceStore.set}
            />
          )}
        </Flex>

        <ResourceEditorForm />
        <ResourceCreatorForm campaignId={campaignId} />
      </VStack>
    );
  };
}
