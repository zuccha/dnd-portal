import { HStack, Span, type StackProps, Text, VStack } from "@chakra-ui/react";
import { XIcon } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { FeatureEntry } from "~/models/resources/features/feature-entry";
import { featureStore } from "~/models/resources/features/feature-store";
import type { ResourceOption } from "~/models/resources/resource";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";
import NumberInput from "~/ui/number-input";
import Search, { type SearchRefObject } from "~/ui/search";
import SortableListDropIndicator from "~/ui/sortable-list-drop-indicator";
import SortableListHandle from "~/ui/sortable-list-handle";
import { useSortableList } from "~/ui/use-sortable-list";
import { normalizeString } from "~/utils/string";

//------------------------------------------------------------------------------
// Feature Entries Editor
//------------------------------------------------------------------------------

export type FeatureEntriesEditorProps = StackProps & {
  onValueChange: (featureEntries: FeatureEntry[]) => void;
  sourceId: string;
  value: FeatureEntry[];
  withinDialog?: boolean;
};

const useFeatureResourceOptions = featureStore.useResourceOptions;

export default function FeatureEntriesEditor({
  onValueChange,
  value,
  withinDialog,
  ...rest
}: FeatureEntriesEditorProps) {
  const { t } = useI18nLangContext(i18nContext);

  const searchRef = useRef<SearchRefObject>(null);

  const [featureId, setFeatureId] = useState("");
  const [minLevel, setMinLevel] = useState(0);

  const options = useFeatureResourceOptions();
  const optionMap = useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options],
  );
  const sortableItems = useMemo(() => {
    const occurrences = new Map<string, number>();

    return value.map((entry) => {
      const key = `${entry.id}.${entry.minimum_level}`;
      const occurrence = occurrences.get(key) ?? 0;
      occurrences.set(key, occurrence + 1);
      return { id: `${key}.${occurrence}` };
    });
  }, [value]);

  const filterResourceOptions = useCallback((option: ResourceOption, search: string): boolean => {
    const normalizedFilter = normalizeString(search);
    return Object.values(option.name)
      .filter((name) => name)
      .some((name) => normalizeString(name!).includes(normalizedFilter));
  }, []);

  const addFeature = useCallback(() => {
    if (!featureId) return;
    if (value.some((entry) => entry.id === featureId && entry.minimum_level === minLevel)) return;

    onValueChange([...value, { id: featureId, minimum_level: minLevel }]);
    setFeatureId("");
    setMinLevel(0);
    searchRef.current?.clear();
    searchRef.current?.focus();
  }, [featureId, minLevel, onValueChange, value]);

  const moveFeature = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= value.length || fromIndex === toIndex) return;

      const next = [...value];
      const [entry] = next.splice(fromIndex, 1);
      if (!entry) return;

      next.splice(toIndex, 0, entry);
      onValueChange(next);
    },
    [onValueChange, value],
  );
  const moveSortableFeature = useCallback(
    (itemId: string, toIndex: number) => {
      const fromIndex = sortableItems.findIndex(({ id }) => id === itemId);
      if (fromIndex >= 0) moveFeature(fromIndex, toIndex);
    },
    [moveFeature, sortableItems],
  );
  const getSortableItemProps = useSortableList(sortableItems, moveSortableFeature);

  const removeFeature = useCallback(
    (index: number) => {
      onValueChange(value.filter((_, i) => i !== index));
    },
    [onValueChange, value],
  );

  return (
    <VStack gap={1} {...rest}>
      <HStack gap={1} w="full">
        <NumberInput
          inputProps={{ w: "5em" }}
          max={20}
          min={0}
          onValueChange={setMinLevel}
          value={minLevel}
          w="5em"
        />

        <Search
          emptyLabel={t("no_result")}
          onFilter={filterResourceOptions}
          onValueChange={setFeatureId}
          options={options}
          placeholder={t("search")}
          ref={searchRef}
          value={featureId}
          withinDialog={withinDialog}
        />

        <Button disabled={!featureId} onClick={addFeature} variant="outline">
          {t("add")}
        </Button>
      </HStack>

      {value.length > 0 && (
        <VStack align="stretch" gap={1} w="full">
          {value.map((entry, index) => {
            const sortableProps = getSortableItemProps(sortableItems[index]!.id, index);

            return (
              <HStack
                borderColor="border"
                borderWidth={1}
                gap={2}
                key={sortableItems[index]!.id}
                minH={9}
                position="relative"
                px={2}
                py={1}
                rounded="sm"
                w="full"
                {...sortableProps.itemProps}
              >
                {sortableProps.dropPosition && (
                  <SortableListDropIndicator gap={1} position={sortableProps.dropPosition} />
                )}
                <SortableListHandle
                  label={t("drag_to_reorder")}
                  {...sortableProps.dragHandleProps}
                />

                <Text flex={1} minW={0} truncate>
                  {optionMap.get(entry.id)?.label ?? t("unknown")}
                </Text>

                {entry.minimum_level > 0 && (
                  <Span color="fg.muted" flexShrink={0} fontSize="sm">
                    {formatLevelLabel(entry.minimum_level, t)}
                  </Span>
                )}

                <IconButton
                  Icon={XIcon}
                  label={t("remove")}
                  onClick={() => removeFeature(index)}
                  size="xs"
                  variant="ghost"
                />
              </HStack>
            );
          })}
        </VStack>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Utils
//------------------------------------------------------------------------------

function formatLevelLabel(minLevel: number, t: (key: keyof typeof i18nContext) => string): string {
  return t("level").replace("<1>", `${minLevel}`);
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  add: {
    en: "Add",
    it: "Aggiungi",
  },
  drag_to_reorder: {
    en: "Drag to reorder",
    it: "Trascina per riordinare",
  },
  level: {
    en: "Level <1>",
    it: "Livello <1>",
  },
  no_result: {
    en: "No result",
    it: "Nessun risultato",
  },
  remove: {
    en: "Remove",
    it: "Rimuovi",
  },
  search: {
    en: "Search feature",
    it: "Cerca privilegio",
  },
  unknown: {
    en: "Unknown",
    it: "Sconosciuto",
  },
};
