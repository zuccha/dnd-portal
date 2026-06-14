import { HStack, Span, type StackProps, VStack } from "@chakra-ui/react";
import { PlusIcon } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import {
  type EquipmentBundle,
  formatEquipmentNameWithNotes,
} from "~/models/other/equipment-bundle";
import { equipmentStore } from "~/models/resources/equipment/equipment-store";
import type { ResourceOption } from "~/models/resources/resource";
import Button from "~/ui/button";
import CostInput from "~/ui/cost-input";
import Icon from "~/ui/icon";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import Search, { type SearchRefObject } from "~/ui/search";
import Tag from "~/ui/tag";
import { normalizeString } from "~/utils/string";

//------------------------------------------------------------------------------
// Equipment Bundle Editor
//------------------------------------------------------------------------------

export type EquipmentBundleEditorProps = StackProps & {
  onValueChange: (bundle: EquipmentBundle) => void;
  sourceId: string;
  value: EquipmentBundle;
  withinDialog?: boolean;
};

export default function EquipmentBundleEditor({
  onValueChange,
  sourceId,
  value,
  withinDialog,
  ...rest
}: EquipmentBundleEditorProps) {
  const { lang, t, tpi } = useI18nLangContext(i18nContext);

  const searchRef = useRef<SearchRefObject>(null);

  const [equipmentQuantity, setEquipmentQuantity] = useState(1);
  const [equipmentId, setEquipmentId] = useState("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(
    null,
  );

  const options = equipmentStore.useResourceOptions(sourceId);
  const localize = equipmentStore.useLocalizeResourceName(sourceId, lang);

  const filterResourceOptions = useCallback(
    (option: ResourceOption, search: string): boolean => {
      const normalizedFilter = normalizeString(search);
      return Object.values(option.name)
        .filter((name) => name)
        .some((name) => normalizeString(name!).includes(normalizedFilter));
    },
    [],
  );

  const addEquipment = useCallback(() => {
    if (!equipmentId) return;
    const equipment = {
      id: equipmentId,
      notes: {},
      quantity: equipmentQuantity,
    };
    const index = value.equipments.findIndex(({ id }) => id === equipmentId);
    const equipments =
      index === -1 ?
        [...value.equipments, equipment]
      : value.equipments.map((current, i) =>
          i === index ?
            { ...current, quantity: current.quantity + equipmentQuantity }
          : current,
        );
    onValueChange({ ...value, equipments });
    setSelectedEquipmentId(equipmentId);
    setEquipmentId("");
    setEquipmentQuantity(1);
    searchRef.current?.clear();
    searchRef.current?.focus();
  }, [equipmentId, equipmentQuantity, onValueChange, value]);

  const selectedEquipment = useMemo(
    () => value.equipments.find(({ id }) => id === selectedEquipmentId) ?? null,
    [selectedEquipmentId, value.equipments],
  );

  const updateEquipmentQuantity = useCallback(
    (id: string, quantity: number) => {
      onValueChange({
        ...value,
        equipments: value.equipments.map((equipment) =>
          equipment.id === id ?
            { ...equipment, quantity: Math.max(1, quantity) }
          : equipment,
        ),
      });
    },
    [onValueChange, value],
  );

  const removeEquipment = useCallback(
    (id: string) => {
      onValueChange({
        ...value,
        equipments: value.equipments.filter((equipment) => equipment.id !== id),
      });
      if (selectedEquipmentId === id) setSelectedEquipmentId(null);
    },
    [onValueChange, selectedEquipmentId, value],
  );

  const updateEquipmentNotes = useCallback(
    (id: string, notes: string) => {
      onValueChange({
        ...value,
        equipments: value.equipments.map((equipment) =>
          equipment.id === id ?
            { ...equipment, notes: { ...equipment.notes, [lang]: notes } }
          : equipment,
        ),
      });
    },
    [lang, onValueChange, value],
  );

  return (
    <VStack gap={1} {...rest}>
      <HStack gap={1} w="full" wrap="wrap">
        <HStack flex={1}>
          <NumberInput
            inputProps={{ w: "5em" }}
            min={1}
            onValueChange={setEquipmentQuantity}
            value={equipmentQuantity}
            w="5em"
          />
          <Search
            emptyLabel={t("no_result")}
            minW="10em"
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
        </HStack>

        <HStack maxW="11em">
          <HStack h={10}>
            <Icon Icon={PlusIcon} size="sm" />
          </HStack>

          <CostInput
            onValueChange={(currency) => onValueChange({ ...value, currency })}
            value={value.currency}
            w="18em"
          />
        </HStack>
      </HStack>

      {value.equipments.length > 0 && (
        <VStack align="stretch" gap={2} w="full">
          <HStack gap={1} w="full" wrap="wrap">
            {value.equipments.map(({ id, notes, quantity }) => (
              <Tag
                borderColor={
                  selectedEquipmentId === id ? "border.info" : undefined
                }
                borderWidth={selectedEquipmentId === id ? 1 : undefined}
                key={id}
                label={
                  <Button
                    _hover={{ textDecoration: "underline" }}
                    onClick={() => setSelectedEquipmentId(id)}
                    unstyled
                  >
                    {tpi(
                      "equipment",
                      quantity,
                      formatEquipmentNameWithNotes(localize(id), notes, lang),
                      `${quantity}`,
                    )}
                  </Button>
                }
                onClose={() => removeEquipment(id)}
              />
            ))}
          </HStack>

          {selectedEquipment && (
            <VStack align="flex-end" gap={1} w="full">
              <HStack borderRadius="sm" borderWidth={1} px={2} py={1} w="full">
                <Span flex={1}>{localize(selectedEquipment.id)}</Span>

                <Input
                  bgColor="bg.info"
                  onValueChange={(notes) =>
                    updateEquipmentNotes(selectedEquipment.id, notes)
                  }
                  placeholder={t("notes")}
                  size="sm"
                  value={selectedEquipment.notes[lang] ?? ""}
                />

                <NumberInput
                  min={1}
                  onValueChange={(quantity) =>
                    updateEquipmentQuantity(selectedEquipment.id, quantity)
                  }
                  size="sm"
                  value={selectedEquipment.quantity}
                  w="5em"
                />
              </HStack>

              <Button
                onClick={() => setSelectedEquipmentId(null)}
                size="xs"
                variant="outline"
              >
                {t("done")}
              </Button>
            </VStack>
          )}
        </VStack>
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
  "done": {
    en: "Close",
    it: "Chiudi",
  },
  "empty": {
    en: "None",
    it: "Nessuno",
  },
  "equipment/*": {
    en: "<1> (<2>)", // <1> = name, <2> = quantity
    it: "<1> (<2>)", // <1> = name, <2> = quantity
  },
  "equipment/1": {
    en: "<1>",
    it: "<1>",
  },
  "no_result": {
    en: "No result",
    it: "Nessun risultato",
  },
  "notes": {
    en: "Notes",
    it: "Note",
  },
  "search": {
    en: "Search",
    it: "Cerca",
  },
};
