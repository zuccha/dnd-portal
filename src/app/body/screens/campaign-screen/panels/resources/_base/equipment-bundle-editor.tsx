import { HStack, type StackProps, Tag, VStack } from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { EquipmentBundle } from "~/models/other/equipment-bundle";
import { equipmentStore } from "~/models/resources/equipment/equipment-store";
import type { LocalizedResourceOption } from "~/models/resources/resource";
import Button from "~/ui/button";
import CostInput from "~/ui/cost-input";
import NumberInput from "~/ui/number-input";
import Search, { type SearchRefObject } from "~/ui/search";
import { normalizeString } from "~/utils/string";

//------------------------------------------------------------------------------
// Equipment Bundle Editor
//------------------------------------------------------------------------------

export type EquipmentBundleEditorProps = StackProps & {
  campaignId: string;
  onValueChange: (bundle: EquipmentBundle) => void;
  value: EquipmentBundle;
  withinDialog?: boolean;
};

export default function EquipmentBundleEditor({
  campaignId,
  onValueChange,
  value,
  withinDialog,
  ...rest
}: EquipmentBundleEditorProps) {
  const { t, tpi } = useI18nLangContext(i18nContext);

  const searchRef = useRef<SearchRefObject>(null);

  const [equipmentQuantity, setEquipmentQuantity] = useState(1);
  const [equipmentId, setEquipmentId] = useState("");

  const options = equipmentStore.useLocalizedResourceOptions(campaignId);
  const localize = equipmentStore.useLocalizeResourceName(campaignId);

  const filterResourceOptions = useCallback(
    (option: LocalizedResourceOption, search: string): boolean => {
      const normalizedFilter = normalizeString(search);
      return Object.values(option.name)
        .filter((name) => name)
        .some((name) => normalizeString(name!).includes(normalizedFilter));
    },
    [],
  );

  const addEquipment = useCallback(() => {
    if (!equipmentId) return;
    const equipment = { id: equipmentId, quantity: equipmentQuantity };
    onValueChange({ ...value, equipments: [...value.equipments, equipment] });
    setEquipmentId("");
    setEquipmentQuantity(1);
    searchRef.current?.clear();
    searchRef.current?.focus();
  }, [equipmentId, equipmentQuantity, onValueChange, value]);

  return (
    <VStack gap={1} {...rest}>
      <HStack gap={1} w="full">
        <NumberInput
          inputProps={{ w: "5em" }}
          min={1}
          onValueChange={setEquipmentQuantity}
          value={equipmentQuantity}
          w="5em"
        />
        <Search
          emptyLabel={t("no_result")}
          onFilter={filterResourceOptions}
          onValueChange={setEquipmentId}
          options={options}
          placeholder={t("search")}
          ref={searchRef}
          value={equipmentId}
          withinDialog={withinDialog}
        />
        <Button
          disabled={!equipmentId}
          onClick={addEquipment}
          variant="outline"
        >
          {t("add")}
        </Button>
        :
        <CostInput
          onValueChange={(currency) => onValueChange({ ...value, currency })}
          value={value.currency}
          w="18em"
        />
      </HStack>

      {value.equipments.length > 0 && (
        <HStack gap={1} w="full" wrap="wrap">
          {value.equipments.map(({ id, quantity }) => (
            <Tag.Root key={id}>
              <Tag.Label>
                {tpi("equipment", quantity, localize(id), `${quantity}`)}
              </Tag.Label>
              <Tag.EndElement>
                <Tag.CloseTrigger
                  onClick={() =>
                    onValueChange({
                      ...value,
                      equipments: value.equipments.filter((e) => e.id !== id),
                    })
                  }
                />
              </Tag.EndElement>
            </Tag.Root>
          ))}
        </HStack>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "add": {
    en: "Add",
    it: "Aggiungi",
  },
  "empty": {
    en: "None",
    it: "Nessuno",
  },
  "equipment/*": {
    en: "<2> <1>", // <1> = name, <2> = quantity
    it: "<2> <1>", // <1> = name, <2> = quantity
  },
  "equipment/1": {
    en: "<1>",
    it: "<1>",
  },
  "no_result": {
    en: "No result",
    it: "Nessun risultato",
  },
  "search": {
    en: "Search",
    it: "Cerca",
  },
};
