import { SimpleGrid, Span, type StackProps, VStack } from "@chakra-ui/react";
import { XIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { defaultEquipmentBundle, type EquipmentBundle } from "~/models/other/equipment-bundle";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";
import { removeItem, replaceItem } from "~/utils/array";
import { numberToLetter } from "~/utils/number";
import EquipmentBundleEditor from "../equipment-bundle-editor";

//------------------------------------------------------------------------------
// Starting Equipment Editor
//------------------------------------------------------------------------------

export type StartingEquipmentEditorProps = StackProps & {
  sourceId: string;
  value: EquipmentBundle[][];
  onValueChange: (value: EquipmentBundle[][]) => void;
};

export default function StartingEquipmentEditor({
  sourceId,
  value,
  onValueChange,
  ...rest
}: StartingEquipmentEditorProps) {
  const { t, ti } = useI18nLangContext(i18nContext);

  return (
    <VStack align="flex-start" {...rest}>
      {value.map((group, i) => (
        <StartingEquipmentGroupEditor
          equipmentBundles={group}
          key={i}
          label={ti("group", `${i + 1}`)}
          onGroupChange={(g) => onValueChange(replaceItem(value, i, g))}
          onGroupRemove={() => onValueChange(removeItem(value, i))}
          sourceId={sourceId}
          w="full"
        />
      ))}

      <Button
        _hover={{ textDecoration: "underline" }}
        cursor="pointer"
        onClick={() => onValueChange([...value, []])}
        unstyled
      >
        {t("group.add")}
      </Button>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Starting Equipment Group Editor
//------------------------------------------------------------------------------

type StartingEquipmentGroupEditorProps = StackProps & {
  sourceId: string;
  equipmentBundles: EquipmentBundle[];
  label: string;
  onGroupChange: (group: EquipmentBundle[]) => void;
  onGroupRemove: () => void;
};

function StartingEquipmentGroupEditor({
  sourceId,
  label,
  equipmentBundles,
  onGroupChange,
  onGroupRemove,
  ...rest
}: StartingEquipmentGroupEditorProps) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <VStack align="flex-start" gap={1} {...rest}>
      <Span>
        <Span fontSize="sm" fontWeight="medium">
          {label}
        </Span>

        <Separator />

        <Button
          _hover={{ textDecoration: "underline" }}
          cursor="pointer"
          onClick={() => onGroupChange([...equipmentBundles, defaultEquipmentBundle])}
          unstyled
        >
          {t("option.add")}
        </Button>

        <Separator />

        <Button
          _hover={{ textDecoration: "underline" }}
          color="fg.error"
          cursor="pointer"
          onClick={onGroupRemove}
          unstyled
        >
          {t("group.remove")}
        </Button>
      </Span>

      <SimpleGrid gapY={2} templateColumns="max-content 1fr max-content" w="full">
        {equipmentBundles.map((equipmentBundle, i) => (
          <StartingEquipmentOptionEditor
            iconLabel={t("remove")}
            key={i}
            label={numberToLetter(i)}
            onEquipmentBundleChange={(o) => onGroupChange(replaceItem(equipmentBundles, i, o))}
            onEquipmentBundleRemove={() => onGroupChange(removeItem(equipmentBundles, i))}
            option={equipmentBundle}
            sourceId={sourceId}
          />
        ))}
      </SimpleGrid>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Starting Equipment Option Editor
//------------------------------------------------------------------------------

type StartingEquipmentOptionEditorProps = {
  iconLabel: string;
  label: string;
  onEquipmentBundleChange: (option: EquipmentBundle) => void;
  onEquipmentBundleRemove: () => void;
  option: EquipmentBundle;
  sourceId: string;
};

function StartingEquipmentOptionEditor({
  iconLabel,
  label,
  onEquipmentBundleChange,
  onEquipmentBundleRemove,
  option,
  sourceId,
}: StartingEquipmentOptionEditorProps) {
  return (
    <>
      <Span p={2}>({label})</Span>

      <EquipmentBundleEditor
        onValueChange={onEquipmentBundleChange}
        sourceId={sourceId}
        value={option}
        w="full"
        withinDialog
      />

      <IconButton
        Icon={XIcon}
        label={iconLabel}
        onClick={onEquipmentBundleRemove}
        variant="ghost"
      />
    </>
  );
}

//------------------------------------------------------------------------------
// Separator
//------------------------------------------------------------------------------

function Separator() {
  return (
    <Span color="fg.subtle" fontWeight="normal" px={2}>
      |
    </Span>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "group": {
    en: "Group <1>",
    it: "Gruppo <1>",
  },
  "group.add": {
    en: "+ Add Group",
    it: "+ Aggiungi Gruppo",
  },
  "group.remove": {
    en: "Remove",
    it: "Rimuovi",
  },
  "option.add": {
    en: "Add Option",
    it: "Aggiungi Opzione",
  },
  "remove": {
    en: "Remove",
    it: "Rimuovi",
  },
};
