import { HStack, Span, type StackProps, Text, VStack } from "@chakra-ui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  GripVerticalIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { DBFeatureEntry } from "~/models/resources/features/db-feature";
import { featureStore } from "~/models/resources/features/feature-store";
import type { ResourceOption } from "~/models/resources/resource";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";
import NumberInput from "~/ui/number-input";
import Search, { type SearchRefObject } from "~/ui/search";
import { normalizeString } from "~/utils/string";

//------------------------------------------------------------------------------
// Feature Entries Editor
//------------------------------------------------------------------------------

export type FeatureEntriesEditorProps = StackProps & {
  onValueChange: (featureEntries: DBFeatureEntry[]) => void;
  sourceId: string;
  value: DBFeatureEntry[];
  withinDialog?: boolean;
};

export default function FeatureEntriesEditor({
  onValueChange,
  sourceId,
  value,
  withinDialog,
  ...rest
}: FeatureEntriesEditorProps) {
  const { t } = useI18nLangContext(i18nContext);

  const searchRef = useRef<SearchRefObject>(null);

  const [featureId, setFeatureId] = useState("");
  const [minLevel, setMinLevel] = useState(0);

  const options = featureStore.useResourceOptions(sourceId);
  const optionMap = useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options],
  );

  const filterResourceOptions = useCallback(
    (option: ResourceOption, search: string): boolean => {
      const normalizedFilter = normalizeString(search);
      return Object.values(option.name)
        .filter((name) => name)
        .some((name) => normalizeString(name!).includes(normalizedFilter));
    },
    [],
  );

  const addFeature = useCallback(() => {
    if (!featureId) return;
    if (
      value.some(
        (entry) => entry.id === featureId && entry.min_level === minLevel,
      )
    )
      return;

    onValueChange([...value, { id: featureId, min_level: minLevel }]);
    setFeatureId("");
    setMinLevel(0);
    searchRef.current?.clear();
    searchRef.current?.focus();
  }, [featureId, minLevel, onValueChange, value]);

  const moveFeature = useCallback(
    (index: number, delta: number) => {
      const nextIndex = index + delta;
      if (nextIndex < 0 || nextIndex >= value.length) return;

      const next = [...value];
      const [entry] = next.splice(index, 1);
      if (!entry) return;

      next.splice(nextIndex, 0, entry);
      onValueChange(next);
    },
    [onValueChange, value],
  );

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
          {value.map((entry, index) => (
            <HStack
              borderColor="border"
              borderWidth={1}
              gap={2}
              key={`${entry.id}.${entry.min_level}.${index}`}
              minH={9}
              px={2}
              py={1}
              rounded="sm"
              w="full"
            >
              <Span color="fg.muted" flexShrink={0}>
                <GripVerticalIcon size={16} />
              </Span>

              <Text flex={1} minW={0} truncate>
                {optionMap.get(entry.id)?.label ?? t("unknown")}
              </Text>

              {entry.min_level > 0 && (
                <Span color="fg.muted" flexShrink={0} fontSize="sm">
                  {formatLevelLabel(entry.min_level, t)}
                </Span>
              )}

              <HStack flexShrink={0} gap={0}>
                <IconButton
                  Icon={ArrowUpIcon}
                  aria-label={t("move_up")}
                  disabled={index === 0}
                  onClick={() => moveFeature(index, -1)}
                  size="xs"
                  variant="ghost"
                />
                <IconButton
                  Icon={ArrowDownIcon}
                  aria-label={t("move_down")}
                  disabled={index === value.length - 1}
                  onClick={() => moveFeature(index, 1)}
                  size="xs"
                  variant="ghost"
                />
                <IconButton
                  Icon={XIcon}
                  aria-label={t("remove")}
                  onClick={() => removeFeature(index)}
                  size="xs"
                  variant="ghost"
                />
              </HStack>
            </HStack>
          ))}
        </VStack>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Utils
//------------------------------------------------------------------------------

function formatLevelLabel(
  minLevel: number,
  t: (key: keyof typeof i18nContext) => string,
): string {
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
  level: {
    en: "Level <1>",
    it: "Livello <1>",
  },
  move_down: {
    en: "Move down",
    it: "Sposta giù",
  },
  move_up: {
    en: "Move up",
    it: "Sposta su",
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
