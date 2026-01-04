import { HStack, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { CharacterClass } from "~/models/resources/character-classes/character-class";
import type { StartingEquipmentGroup } from "~/models/resources/character-classes/starting-equipment";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import { spellStore } from "~/models/resources/spells/spell-store";
import { useArmorTypeOptions } from "~/models/types/armor-type";
import { useCampaignRoleOptions } from "~/models/types/campaign-role";
import { useCreatureAbilityOptions } from "~/models/types/creature-ability";
import { useCreatureSkillOptions } from "~/models/types/creature-skill";
import { useDieTypeOptions } from "~/models/types/die_type";
import { useWeaponTypeOptions } from "~/models/types/weapon-type";
import Field from "~/ui/field";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";
import ResourceSearch from "../_base/resource-search";
import {
  useCharacterClassEditorFormArmorProficiencies,
  useCharacterClassEditorFormArmorProficienciesExtra,
  useCharacterClassEditorFormHpDie,
  useCharacterClassEditorFormName,
  useCharacterClassEditorFormPage,
  useCharacterClassEditorFormPrimaryAbilities,
  useCharacterClassEditorFormSavingThrowProficiencies,
  useCharacterClassEditorFormSkillProficienciesPool,
  useCharacterClassEditorFormSkillProficienciesPoolQuantity,
  useCharacterClassEditorFormSpellIds,
  useCharacterClassEditorFormStartingEquipment,
  useCharacterClassEditorFormToolProficiencyIds,
  useCharacterClassEditorFormVisibility,
  useCharacterClassEditorFormWeaponProficiencies,
  useCharacterClassEditorFormWeaponProficienciesExtra,
} from "./character-class-editor-form";
import StartingEquipmentEditor from "./starting-equipment-editor";

//------------------------------------------------------------------------------
// Character Class Editor
//------------------------------------------------------------------------------

export type CharacterClassEditorProps = {
  campaignId: string;
  resource: CharacterClass;
};

export default function CharacterClassEditor({
  campaignId,
  resource,
}: CharacterClassEditorProps) {
  const { lang } = useI18nLangContext(i18nContext);

  return (
    <VStack align="stretch" gap={4}>
      <HStack align="flex-start" gap={4}>
        <CharacterClassEditorName defaultName={resource.name[lang] ?? ""} />
        <CharacterClassEditorPage defaultPage={resource.page?.[lang] ?? 0} />
        <CharacterClassEditorVisibility
          defaultVisibility={resource.visibility}
        />
      </HStack>

      <HStack gap={4} w="full">
        <CharacterClassEditorPrimaryAbilities
          defaultPrimaryAbilities={resource.primary_abilities}
        />

        <CharacterClassEditorHpDie defaultHpDie={resource.hp_die} />
      </HStack>

      <CharacterClassEditorSavingThrowProficiencies
        defaultSavingThrowProficiencies={resource.saving_throw_proficiencies}
      />

      <HStack gap={4} w="full">
        <CharacterClassEditorSkillProficienciesPool
          defaultSkillProficienciesPool={resource.skill_proficiencies_pool}
        />

        <CharacterClassEditorSkillProficienciesPoolQuantity
          defaultSkillProficienciesPoolQuantity={
            resource.skill_proficiencies_pool_quantity
          }
        />
      </HStack>

      <HStack gap={2} w="full">
        <CharacterClassEditorWeaponProficiencies
          defaultWeaponProficiencies={resource.weapon_proficiencies}
        />
        <CharacterClassEditorWeaponProficienciesExtra
          defaultWeaponProficienciesExtra={
            resource.weapon_proficiencies_extra[lang] ?? ""
          }
        />
      </HStack>

      <CharacterClassEditorToolProficiencyIds
        campaignId={campaignId}
        defaultToolProficiencyIds={resource.tool_proficiency_ids}
      />

      <HStack gap={2} w="full">
        <CharacterClassEditorArmorProficiencies
          defaultArmorProficiencies={resource.armor_proficiencies}
        />
        <CharacterClassEditorArmorProficienciesExtra
          defaultArmorProficienciesExtra={
            resource.armor_proficiencies_extra[lang] ?? ""
          }
        />
      </HStack>

      <CharacterClassEditorStartingEquipment
        campaignId={campaignId}
        defaultStartingEquipment={resource.starting_equipment}
      />

      <CharacterClassEditorSpellIds
        campaignId={campaignId}
        defaultSpellIds={resource.spell_ids}
      />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Armor Proficiencies
//------------------------------------------------------------------------------

function CharacterClassEditorArmorProficiencies({
  defaultArmorProficiencies,
}: {
  defaultArmorProficiencies: CharacterClass["armor_proficiencies"];
}) {
  const armorTypeOptions = useArmorTypeOptions();
  const { error, ...rest } = useCharacterClassEditorFormArmorProficiencies(
    defaultArmorProficiencies,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("armor_proficiencies.label")}>
      <Select
        multiple
        options={armorTypeOptions}
        placeholder={t("armor_proficiencies.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Armor Proficiencies Extra
//------------------------------------------------------------------------------

function CharacterClassEditorArmorProficienciesExtra({
  defaultArmorProficienciesExtra,
}: {
  defaultArmorProficienciesExtra: string;
}) {
  const { error, ...rest } = useCharacterClassEditorFormArmorProficienciesExtra(
    defaultArmorProficienciesExtra,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("armor_proficiencies_extra.label")}>
      <Input
        bgColor="bg.info"
        placeholder={t("armor_proficiencies_extra.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// HP Die
//------------------------------------------------------------------------------

function CharacterClassEditorHpDie({
  defaultHpDie,
}: {
  defaultHpDie: CharacterClass["hp_die"];
}) {
  const dieTypeOptions = useDieTypeOptions();
  const { error, ...rest } = useCharacterClassEditorFormHpDie(defaultHpDie);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("hp_die.label")}>
      <Select
        options={dieTypeOptions}
        placeholder={t("hp_die.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function CharacterClassEditorName({ defaultName }: { defaultName: string }) {
  const { error, ...rest } = useCharacterClassEditorFormName(defaultName);
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
// Page
//------------------------------------------------------------------------------

function CharacterClassEditorPage({ defaultPage }: { defaultPage: number }) {
  const { error, ...rest } = useCharacterClassEditorFormPage(defaultPage);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("page.label")} maxW="6em">
      <NumberInput bgColor="bg.info" {...rest} w="6em" />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Primary Abilities
//------------------------------------------------------------------------------

function CharacterClassEditorPrimaryAbilities({
  defaultPrimaryAbilities,
}: {
  defaultPrimaryAbilities: CharacterClass["primary_abilities"];
}) {
  const abilityOptions = useCreatureAbilityOptions();
  const { error, ...rest } = useCharacterClassEditorFormPrimaryAbilities(
    defaultPrimaryAbilities,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("primary_abilities.label")}>
      <Select
        multiple
        options={abilityOptions}
        placeholder={t("primary_abilities.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Saving Throw Proficiencies
//------------------------------------------------------------------------------

function CharacterClassEditorSavingThrowProficiencies({
  defaultSavingThrowProficiencies,
}: {
  defaultSavingThrowProficiencies: CharacterClass["saving_throw_proficiencies"];
}) {
  const abilityOptions = useCreatureAbilityOptions();
  const { error, ...rest } =
    useCharacterClassEditorFormSavingThrowProficiencies(
      defaultSavingThrowProficiencies,
    );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("saving_throw_proficiencies.label")}>
      <Select
        multiple
        options={abilityOptions}
        placeholder={t("saving_throw_proficiencies.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Skill Proficiencies Pool
//------------------------------------------------------------------------------

function CharacterClassEditorSkillProficienciesPool({
  defaultSkillProficienciesPool,
}: {
  defaultSkillProficienciesPool: CharacterClass["skill_proficiencies_pool"];
}) {
  const skillOptions = useCreatureSkillOptions();
  const { error, ...rest } = useCharacterClassEditorFormSkillProficienciesPool(
    defaultSkillProficienciesPool,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("skill_proficiencies_pool.label")}>
      <Select
        multiple
        options={skillOptions}
        placeholder={t("skill_proficiencies_pool.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Skill Proficiencies Pool Quantity
//------------------------------------------------------------------------------

function CharacterClassEditorSkillProficienciesPoolQuantity({
  defaultSkillProficienciesPoolQuantity,
}: {
  defaultSkillProficienciesPoolQuantity: number;
}) {
  const { error, ...rest } =
    useCharacterClassEditorFormSkillProficienciesPoolQuantity(
      defaultSkillProficienciesPoolQuantity,
    );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("skill_proficiencies_pool_quantity.label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Ids
//------------------------------------------------------------------------------

function CharacterClassEditorSpellIds({
  campaignId,
  defaultSpellIds,
}: {
  campaignId: string;
  defaultSpellIds: CharacterClass["spell_ids"];
}) {
  const spellOptions = spellStore.useLocalizedResourceOptions(campaignId);

  const { error, ...rest } =
    useCharacterClassEditorFormSpellIds(defaultSpellIds);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("spell_ids.label")}>
      <ResourceSearch options={spellOptions} {...rest} w="full" withinDialog />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Starting Equipment Extra
//------------------------------------------------------------------------------

function CharacterClassEditorStartingEquipment({
  campaignId,
  defaultStartingEquipment,
}: {
  campaignId: string;
  defaultStartingEquipment: StartingEquipmentGroup[];
}) {
  const { error, ...rest } = useCharacterClassEditorFormStartingEquipment(
    defaultStartingEquipment,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("starting_equipment.label")}>
      <StartingEquipmentEditor campaignId={campaignId} w="full" {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Tool Proficiency Ids
//------------------------------------------------------------------------------

function CharacterClassEditorToolProficiencyIds({
  campaignId,
  defaultToolProficiencyIds,
}: {
  campaignId: string;
  defaultToolProficiencyIds: CharacterClass["tool_proficiency_ids"];
}) {
  const toolOptions = toolStore.useLocalizedResourceOptions(campaignId);
  const { error, ...rest } = useCharacterClassEditorFormToolProficiencyIds(
    defaultToolProficiencyIds,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("tool_proficiency_ids.label")}>
      <Select
        multiple
        options={toolOptions}
        placeholder={t("tool_proficiency_ids.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

function CharacterClassEditorVisibility({
  defaultVisibility,
}: {
  defaultVisibility: CharacterClass["visibility"];
}) {
  const visibilityOptions = useCampaignRoleOptions();
  const { error, ...rest } =
    useCharacterClassEditorFormVisibility(defaultVisibility);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("visibility.label")} maxW="10em">
      <Select options={visibilityOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Weapon Proficiencies
//------------------------------------------------------------------------------

function CharacterClassEditorWeaponProficiencies({
  defaultWeaponProficiencies,
}: {
  defaultWeaponProficiencies: CharacterClass["weapon_proficiencies"];
}) {
  const weaponTypeOptions = useWeaponTypeOptions();
  const { error, ...rest } = useCharacterClassEditorFormWeaponProficiencies(
    defaultWeaponProficiencies,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("weapon_proficiencies.label")}>
      <Select
        multiple
        options={weaponTypeOptions}
        placeholder={t("weapon_proficiencies.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Weapon Proficiencies Extra
//------------------------------------------------------------------------------

function CharacterClassEditorWeaponProficienciesExtra({
  defaultWeaponProficienciesExtra,
}: {
  defaultWeaponProficienciesExtra: string;
}) {
  const { error, ...rest } =
    useCharacterClassEditorFormWeaponProficienciesExtra(
      defaultWeaponProficienciesExtra,
    );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("weapon_proficiencies_extra.label")}>
      <Input
        bgColor="bg.info"
        placeholder={t("weapon_proficiencies_extra.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//----------------------------------------------------------------------------
// I18n Context
//----------------------------------------------------------------------------

const i18nContext = {
  "armor_proficiencies.label": {
    en: "Armor Training",
    it: "Competenze nelle Armature",
  },
  "armor_proficiencies.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "armor_proficiencies_extra.label": {
    en: "Other",
    it: "Altro",
  },
  "armor_proficiencies_extra.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "hp_die.label": {
    en: "Hit Point Die",
    it: "Dado Vita",
  },
  "hp_die.placeholder": {
    en: "None",
    it: "Nessuno",
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
    en: "E.g.: Barbarian",
    it: "Es: Barbaro",
  },
  "page.label": {
    en: "Page",
    it: "Pagina",
  },
  "primary_abilities.label": {
    en: "Primary Abilities",
    it: "Abilità Primarie",
  },
  "primary_abilities.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "saving_throw_proficiencies.label": {
    en: "Saving Throw Proficiencies",
    it: "Competenze nei Tiri Salvezza",
  },
  "saving_throw_proficiencies.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "skill_proficiencies_pool.label": {
    en: "Skill Proficiencies",
    it: "Competenze nelle Abilità",
  },
  "skill_proficiencies_pool.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "skill_proficiencies_pool_quantity.label": {
    en: "Quantity",
    it: "Quantità",
  },
  "spell_ids.label": {
    en: "Spells",
    it: "Incantesimi",
  },
  "spell_ids.placeholder": {
    en: "Search spell",
    it: "Cerca incantesimo",
  },
  "starting_equipment.label": {
    en: "Starting Equipment",
    it: "Equipaggiamento Iniziale",
  },
  "starting_equipment.placeholder": {
    en: "None",
    it: "Nessuno",
  },
  "tool_proficiency_ids.label": {
    en: "Tool Proficiencies",
    it: "Competenza negli Strumenti",
  },
  "tool_proficiency_ids.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "visibility.label": {
    en: "Visibility",
    it: "Visibilità",
  },
  "weapon_proficiencies.label": {
    en: "Weapon Proficiencies",
    it: "Competenze nelle Armi",
  },
  "weapon_proficiencies.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "weapon_proficiencies_extra.label": {
    en: "Other",
    it: "Altro",
  },
  "weapon_proficiencies_extra.placeholder": {
    en: "None",
    it: "Nessuna",
  },
};
