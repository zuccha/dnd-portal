import { HStack, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Item } from "~/models/resources/equipment/items/item";
import { useCampaignRoleOptions } from "~/models/types/campaign-role";
import { useEquipmentRarityOptions } from "~/models/types/equipment-rarity";
import CostInput from "~/ui/cost-input";
import Field from "~/ui/field";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";
import Switch from "~/ui/switch";
import Textarea from "~/ui/textarea";
import WeightInput from "~/ui/weight-input";
import {
  useItemEditorFormCost,
  useItemEditorFormMagic,
  useItemEditorFormName,
  useItemEditorFormNotes,
  useItemEditorFormPage,
  useItemEditorFormRarity,
  useItemEditorFormVisibility,
  useItemEditorFormWeight,
} from "./item-editor-form";

//------------------------------------------------------------------------------
// Item Editor
//------------------------------------------------------------------------------

export type ItemEditorProps = {
  resource: Item;
};

export default function ItemEditor({ resource }: ItemEditorProps) {
  const { lang } = useI18nLangContext(i18nContext);

  return (
    <VStack align="stretch" gap={4}>
      <HStack align="flex-start" gap={4}>
        <ItemEditorName defaultName={resource.name[lang] ?? ""} />
        <ItemEditorPage defaultPage={resource.page?.[lang] ?? 0} />
        <ItemEditorVisibility defaultVisibility={resource.visibility} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <ItemEditorWeight defaultWeight={resource.weight} />
        <ItemEditorCost defaultCost={resource.cost} />
        <ItemEditorRarity defaultRarity={resource.rarity} />
      </HStack>

      <ItemEditorMagic defaultMagic={resource.magic} />

      <ItemEditorNotes defaultNotes={resource.notes[lang] ?? ""} />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Cost
//------------------------------------------------------------------------------

function ItemEditorCost({ defaultCost }: { defaultCost: number }) {
  const { error, ...rest } = useItemEditorFormCost(defaultCost);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("cost.label")}>
      <CostInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Magic
//------------------------------------------------------------------------------

function ItemEditorMagic({ defaultMagic }: { defaultMagic: boolean }) {
  const { error: _, ...rest } = useItemEditorFormMagic(defaultMagic);
  const { t } = useI18nLangContext(i18nContext);

  return <Switch label={t("magic.label")} size="lg" {...rest} />;
}

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function ItemEditorName({ defaultName }: { defaultName: string }) {
  const { error, ...rest } = useItemEditorFormName(defaultName);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("name.label")}>
      <Input
        autoComplete="off"
        bgColor="bg.info"
        placeholder={t("name.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Notes
//------------------------------------------------------------------------------

function ItemEditorNotes({ defaultNotes }: { defaultNotes: string }) {
  const { error, ...rest } = useItemEditorFormNotes(defaultNotes);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("notes.label")}>
      <Textarea
        bgColor="bg.info"
        placeholder={t("notes.placeholder")}
        rows={5}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

function ItemEditorPage({ defaultPage }: { defaultPage: number }) {
  const { error, ...rest } = useItemEditorFormPage(defaultPage);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("page.label")} maxW="6em">
      <NumberInput bgColor="bg.info" {...rest} w="6em" />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Rarity
//------------------------------------------------------------------------------

function ItemEditorRarity({
  defaultRarity,
}: {
  defaultRarity: Item["rarity"];
}) {
  const rarityOptions = useEquipmentRarityOptions();
  const { error, ...rest } = useItemEditorFormRarity(defaultRarity);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("rarity.label")}>
      <Select.Enum options={rarityOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

function ItemEditorVisibility({
  defaultVisibility,
}: {
  defaultVisibility: Item["visibility"];
}) {
  const visibilityOptions = useCampaignRoleOptions();
  const { error, ...rest } = useItemEditorFormVisibility(defaultVisibility);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("visibility.label")} maxW="10em">
      <Select.Enum options={visibilityOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Weight
//------------------------------------------------------------------------------

function ItemEditorWeight({ defaultWeight }: { defaultWeight: number }) {
  const { error, ...rest } = useItemEditorFormWeight(defaultWeight);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("weight.label")}>
      <WeightInput min={0} {...rest} />
    </Field>
  );
}

//----------------------------------------------------------------------------
// I18n Context
//----------------------------------------------------------------------------

const i18nContext = {
  "cost.label": {
    en: "Cost",
    it: "Costo",
  },
  "magic.label": {
    en: "Magic",
    it: "Magico",
  },
  "name.error.empty": {
    en: "The name cannot be empty",
    it: "Il nome non può essere vuoto",
  },
  "name.label": {
    en: "Name",
    it: "Nome",
  },
  "name.placeholder": {
    en: "E.g.: Candle",
    it: "Es: Candela",
  },
  "notes.label": {
    en: "Notes",
    it: "Note",
  },
  "notes.placeholder": {
    en: "E.g.: For 1 hour, a lit Candle sheds Bright Light in a 5-foot radius and Dim Light for an additional 5 feet.",
    it: "Es: Per 1 ora, una candela accesa proietta luce intensa entro un raggio di 1,5 metri e luce fioca per altri 1,5 metri.",
  },
  "page.label": {
    en: "Page",
    it: "Pagina",
  },
  "rarity.label": {
    en: "Rarity",
    it: "Rarità",
  },
  "visibility.label": {
    en: "Visibility",
    it: "Visibilità",
  },
  "weight.label": {
    en: "Weight",
    it: "Peso",
  },
};
