import { SimpleGrid, Span, type StackProps, VStack } from "@chakra-ui/react";
import { XIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { defaultEquipmentBundle } from "~/models/other/equipment-bundle";
import type {
  StartingEquipmentGroup,
  StartingEquipmentOption,
} from "~/models/resources/character-classes/starting-equipment";
import { removeItem, replaceItem } from "~/ui/array";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";
import { numberToLetter } from "~/utils/number";
import EquipmentBundleEditor from "../equipment-bundle-editor";

//------------------------------------------------------------------------------
// Starting Equipment Editor
//------------------------------------------------------------------------------

export type StartingEquipmentEditorProps = StackProps & {
  campaignId: string;
  value: StartingEquipmentGroup[];
  onValueChange: (value: StartingEquipmentGroup[]) => void;
};

export default function StartingEquipmentEditor({
  campaignId,
  value,
  onValueChange,
  ...rest
}: StartingEquipmentEditorProps) {
  const { t, ti } = useI18nLangContext(i18nContext);

  const nextGroup = Math.max(...value.map(({ group }) => group), 0) + 1;

  return (
    <VStack align="flex-start" {...rest}>
      {value.map((group, i) => (
        <StartingEquipmentGroupEditor
          campaignId={campaignId}
          group={group}
          key={group.group}
          label={ti("group", `${i + 1}`)}
          onGroupChange={(g) => onValueChange(replaceItem(value, i, g))}
          onGroupRemove={() => onValueChange(removeItem(value, i))}
          w="full"
        />
      ))}

      <Button
        _hover={{ textDecoration: "underline" }}
        cursor="pointer"
        onClick={() =>
          onValueChange([...value, { group: nextGroup, options: [] }])
        }
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
  campaignId: string;
  group: StartingEquipmentGroup;
  label: string;
  onGroupChange: (group: StartingEquipmentGroup) => void;
  onGroupRemove: () => void;
};

function StartingEquipmentGroupEditor({
  campaignId,
  label,
  group,
  onGroupChange,
  onGroupRemove,
  ...rest
}: StartingEquipmentGroupEditorProps) {
  const { t } = useI18nLangContext(i18nContext);

  const options = group.options;
  const nextOption =
    Math.max(...group.options.map(({ option }) => option), 0) + 1;

  return (
    <VStack align="flex-start" gap={1} key={group.group} {...rest}>
      <Span>
        <Span fontSize="sm" fontWeight="medium">
          {label}
        </Span>

        <Separator />

        <Button
          _hover={{ textDecoration: "underline" }}
          cursor="pointer"
          onClick={() =>
            onGroupChange({
              ...group,
              options: [
                ...options,
                { bundle: defaultEquipmentBundle, option: nextOption },
              ],
            })
          }
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

      <SimpleGrid
        gapY={2}
        templateColumns="max-content 1fr max-content"
        w="full"
      >
        {options.map((option, i) => (
          <StartingEquipmentOptionEditor
            campaignId={campaignId}
            key={option.option}
            label={numberToLetter(i)}
            onOptionChange={(o) =>
              onGroupChange({ ...group, options: replaceItem(options, i, o) })
            }
            onOptionRemove={() =>
              onGroupChange({ ...group, options: removeItem(options, i) })
            }
            option={option}
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
  campaignId: string;
  label: string;
  onOptionChange: (option: StartingEquipmentOption) => void;
  onOptionRemove: () => void;
  option: StartingEquipmentOption;
};

function StartingEquipmentOptionEditor({
  campaignId,
  label,
  onOptionChange,
  onOptionRemove,
  option,
}: StartingEquipmentOptionEditorProps) {
  return (
    <>
      <Span p={2}>({label})</Span>

      <EquipmentBundleEditor
        campaignId={campaignId}
        onValueChange={(bundle) => onOptionChange({ ...option, bundle })}
        value={option.bundle}
        w="full"
        withinDialog
      />

      <IconButton Icon={XIcon} onClick={onOptionRemove} variant="ghost" />
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
};
