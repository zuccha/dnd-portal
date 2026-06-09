import { HStack, type StackProps, VStack } from "@chakra-ui/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { DBFeatureEntry } from "~/models/resources/features/db-feature";
import { featureStore } from "~/models/resources/features/feature-store";
import type { ResourceOption } from "~/models/resources/resource";
import Button from "~/ui/button";
import NumberInput from "~/ui/number-input";
import Search, { type SearchRefObject } from "~/ui/search";
import Tag from "~/ui/tag";
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
        <HStack gap={1} w="full" wrap="wrap">
          {value.map((entry) => (
            <Tag
              key={`${entry.id}.${entry.min_level}`}
              label={formatFeatureLabel(
                optionMap.get(entry.id)?.label ?? t("unknown"),
                entry.min_level,
                t,
              )}
              onClose={() =>
                onValueChange(
                  value.filter(
                    (other) =>
                      other.id !== entry.id ||
                      other.min_level !== entry.min_level,
                  ),
                )
              }
            />
          ))}
        </HStack>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Utils
//------------------------------------------------------------------------------

function formatFeatureLabel(
  name: string,
  minLevel: number,
  t: (key: keyof typeof i18nContext) => string,
): string {
  if (!minLevel) return name;
  return t("feature").replace("<1>", name).replace("<2>", `${minLevel}`);
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  add: {
    en: "Add",
    it: "Aggiungi",
  },
  feature: {
    en: "<1> (level <2>)",
    it: "<1> (livello <2>)",
  },
  no_result: {
    en: "No result",
    it: "Nessun risultato",
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
