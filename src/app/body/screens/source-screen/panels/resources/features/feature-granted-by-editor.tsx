import { HStack, type StackProps, VStack } from "@chakra-ui/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import { itemStore } from "~/models/resources/equipment/items/item-store";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import { featStore } from "~/models/resources/feats/feat-store";
import type { DBFeatureGrant } from "~/models/resources/features/db-feature";
import type { ResourceOption } from "~/models/resources/resource";
import { speciesStore } from "~/models/resources/species/species-store";
import {
  type ResourceFeatureKind,
  useResourceFeatureKindOptions,
} from "~/models/types/resource-feature-kind";
import Button from "~/ui/button";
import InclusionSelect from "~/ui/inclusion-select";
import NumberInput from "~/ui/number-input";
import Search, { type SearchRefObject } from "~/ui/search";
import Tag from "~/ui/tag";
import { compareObjects } from "~/utils/object";
import { normalizeString } from "~/utils/string";

//------------------------------------------------------------------------------
// Feature Granted By Editor
//------------------------------------------------------------------------------

export type FeatureGrantedByEditorProps = StackProps & {
  onValueChange: (grantedBy: DBFeatureGrant[]) => void;
  sourceId: string;
  value: DBFeatureGrant[];
  withinDialog?: boolean;
};

export default function FeatureGrantedByEditor({
  onValueChange,
  sourceId,
  value,
  withinDialog,
  ...rest
}: FeatureGrantedByEditorProps) {
  const { t } = useI18nLangContext(i18nContext);

  const searchRef = useRef<SearchRefObject>(null);

  const [resourceId, setResourceId] = useState("");
  const [minLevel, setMinLevel] = useState(0);
  const [kindFilters, setKindFilters] = useState<
    Record<string, boolean | undefined>
  >({});

  const options = useFeatureGrantOptions(sourceId);
  const optionMap = useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options],
  );

  const resourceFeatureKindOptions = useResourceFeatureKindOptions();

  const filterResourceOptions = useCallback(
    (option: FeatureGrantOption, search: string): boolean => {
      if (!filterKind(option.kind, kindFilters)) return false;

      const normalizedFilter = normalizeString(search);
      return Object.values(option.name)
        .filter((name) => name)
        .some((name) => normalizeString(name!).includes(normalizedFilter));
    },
    [kindFilters],
  );

  const addGrant = useCallback(() => {
    if (!resourceId) return;
    if (
      value.some(
        (grant) => grant.id === resourceId && grant.min_level === minLevel,
      )
    )
      return;

    onValueChange([...value, { id: resourceId, min_level: minLevel }]);
    setResourceId("");
    setMinLevel(0);
    searchRef.current?.clear();
    searchRef.current?.focus();
  }, [minLevel, onValueChange, resourceId, value]);

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

        <InclusionSelect
          includes={kindFilters}
          onValueChange={(partial) =>
            setKindFilters((prev) => ({ ...prev, ...partial }))
          }
          options={resourceFeatureKindOptions}
          placeholder={t("kind_filter")}
          positioning={{ sameWidth: false, slide: true }}
          w="12em"
        />

        <Search
          emptyLabel={t("no_result")}
          onFilter={filterResourceOptions}
          onValueChange={setResourceId}
          options={options}
          placeholder={t("search")}
          ref={searchRef}
          value={resourceId}
          withinDialog={withinDialog}
        />

        <Button disabled={!resourceId} onClick={addGrant} variant="outline">
          {t("add")}
        </Button>
      </HStack>

      {value.length > 0 && (
        <HStack gap={1} w="full" wrap="wrap">
          {value.map((grant) => (
            <Tag
              key={`${grant.id}.${grant.min_level}`}
              label={formatGrantLabel(
                optionMap.get(grant.id)?.label ?? t("unknown"),
                grant.min_level,
                t,
              )}
              onClose={() =>
                onValueChange(
                  value.filter(
                    (other) =>
                      other.id !== grant.id ||
                      other.min_level !== grant.min_level,
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
// Options
//------------------------------------------------------------------------------

type FeatureGrantOption = ResourceOption & { kind: ResourceFeatureKind };

function useFeatureGrantOptions(sourceId: string): FeatureGrantOption[] {
  const classOptions = characterClassStore.useResourceOptions(sourceId);
  const subclassOptions = characterSubclassStore.useResourceOptions(sourceId);
  const speciesOptions = speciesStore.useResourceOptions(sourceId);
  const featOptions = featStore.useResourceOptions(sourceId);
  const armorOptions = armorStore.useResourceOptions(sourceId);
  const itemOptions = itemStore.useResourceOptions(sourceId);
  const toolOptions = toolStore.useResourceOptions(sourceId);
  const weaponOptions = weaponStore.useResourceOptions(sourceId);

  return useMemo(
    () =>
      [
        ...withKind(classOptions, "character_class"),
        ...withKind(subclassOptions, "character_subclass"),
        ...withKind(speciesOptions, "species"),
        ...withKind(featOptions, "feat"),
        ...withKind(armorOptions, "armor"),
        ...withKind(itemOptions, "item"),
        ...withKind(toolOptions, "tool"),
        ...withKind(weaponOptions, "weapon"),
      ].sort(compareObjects("label")),
    [
      armorOptions,
      classOptions,
      featOptions,
      itemOptions,
      speciesOptions,
      subclassOptions,
      toolOptions,
      weaponOptions,
    ],
  );
}

function withKind(
  options: ResourceOption[],
  kind: ResourceFeatureKind,
): FeatureGrantOption[] {
  return options.map((option) => ({ ...option, kind }));
}

function filterKind(
  kind: ResourceFeatureKind,
  filters: Record<string, boolean | undefined>,
): boolean {
  const included = Object.values(filters).some((value) => value === true);
  if (included) return filters[kind] === true;
  return filters[kind] !== false;
}

//------------------------------------------------------------------------------
// Utils
//------------------------------------------------------------------------------

function formatGrantLabel(
  name: string,
  minLevel: number,
  t: (key: keyof typeof i18nContext) => string,
): string {
  if (!minLevel) return name;
  return t("grant").replace("<1>", name).replace("<2>", `${minLevel}`);
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  add: {
    en: "Add",
    it: "Aggiungi",
  },
  grant: {
    en: "<1> (level <2>)",
    it: "<1> (livello <2>)",
  },
  kind_filter: {
    en: "Kinds",
    it: "Tipi",
  },
  no_result: {
    en: "No result",
    it: "Nessun risultato",
  },
  search: {
    en: "Search",
    it: "Cerca",
  },
  unknown: {
    en: "Unknown",
    it: "Sconosciuto",
  },
};
