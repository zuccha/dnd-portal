import { HStack, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { EquipmentBundle } from "~/models/other/equipment-bundle";
import { type Creature } from "~/models/resources/creatures/creature";
import { useCampaignRoleOptions } from "~/models/types/campaign-role";
import { useCreatureAbilityOptions } from "~/models/types/creature-ability";
import { useCreatureAlignmentOptions } from "~/models/types/creature-alignment";
import { useCreatureConditionOptions } from "~/models/types/creature-condition";
import { useCreatureHabitatOptions } from "~/models/types/creature-habitat";
import { useCreatureSizeOptions } from "~/models/types/creature-size";
import { useCreatureSkillOptions } from "~/models/types/creature-skill";
import { useCreatureTreasureOptions } from "~/models/types/creature-treasure";
import { useCreatureTypeOptions } from "~/models/types/creature-type";
import { useDamageTypeOptions } from "~/models/types/damage-type";
import DistanceInput from "~/ui/distance-input";
import Field from "~/ui/field";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";
import Textarea from "~/ui/textarea";
import EquipmentBundleEditor from "../_base/equipment-bundle-editor";
import {
  useCreatureEditorFormAC,
  useCreatureEditorFormAbilityCha,
  useCreatureEditorFormAbilityCon,
  useCreatureEditorFormAbilityDex,
  useCreatureEditorFormAbilityInt,
  useCreatureEditorFormAbilityProficiencies,
  useCreatureEditorFormAbilityStr,
  useCreatureEditorFormAbilityWis,
  useCreatureEditorFormActions,
  useCreatureEditorFormAlignment,
  useCreatureEditorFormBlindsight,
  useCreatureEditorFormBonusActions,
  useCreatureEditorFormCR,
  useCreatureEditorFormConditionImmunities,
  useCreatureEditorFormConditionResistances,
  useCreatureEditorFormConditionVulnerabilities,
  useCreatureEditorFormDamageImmunities,
  useCreatureEditorFormDamageResistances,
  useCreatureEditorFormDamageVulnerabilities,
  useCreatureEditorFormDarkvision,
  useCreatureEditorFormGear,
  useCreatureEditorFormHP,
  useCreatureEditorFormHPFormula,
  useCreatureEditorFormHabitats,
  useCreatureEditorFormInitiative,
  useCreatureEditorFormLanguages,
  useCreatureEditorFormLegendaryActions,
  useCreatureEditorFormName,
  useCreatureEditorFormPage,
  useCreatureEditorFormPassivePerception,
  useCreatureEditorFormPlanes,
  useCreatureEditorFormReactions,
  useCreatureEditorFormSenses,
  useCreatureEditorFormSize,
  useCreatureEditorFormSkillExpertise,
  useCreatureEditorFormSkillProficiencies,
  useCreatureEditorFormSpeedBurrow,
  useCreatureEditorFormSpeedClimb,
  useCreatureEditorFormSpeedFly,
  useCreatureEditorFormSpeedSwim,
  useCreatureEditorFormSpeedWalk,
  useCreatureEditorFormTraits,
  useCreatureEditorFormTreasures,
  useCreatureEditorFormTremorsense,
  useCreatureEditorFormTruesight,
  useCreatureEditorFormType,
  useCreatureEditorFormVisibility,
} from "./creature-editor-form";

//------------------------------------------------------------------------------
// Creature Editor
//------------------------------------------------------------------------------

export type CreatureEditorProps = {
  campaignId: string;
  resource: Creature;
};

export default function CreatureEditor({
  campaignId,
  resource,
}: CreatureEditorProps) {
  const { lang } = useI18nLangContext(i18nContext);

  return (
    <VStack gap={4} w="full">
      {/* Basic Information */}
      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorName defaultName={resource.name[lang] ?? ""} />
        <CreatureEditorPage defaultPage={resource.page?.[lang] ?? 0} />
        <CreatureEditorVisibility defaultVisibility={resource.visibility} />
      </HStack>

      {/* Type and Basic Stats */}
      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorType defaultType={resource.type} />
        <CreatureEditorSize defaultSize={resource.size} />
        <CreatureEditorAlignment defaultAlignment={resource.alignment} />
      </HStack>

      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorTreasures defaultTreasures={resource.treasures} />
        <CreatureEditorHabitats defaultHabitat={resource.habitats} />
        <CreatureEditorPlanes defaultPlanes={resource.planes[lang] ?? ""} />
      </HStack>

      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorHP defaultHP={resource.hp} />
        <CreatureEditorHPFormula defaultHPFormula={resource.hp_formula} />
        <CreatureEditorCR defaultCR={resource.cr} />
      </HStack>

      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorAC defaultAC={resource.ac} />
        <CreatureEditorInitiative defaultInitiative={resource.initiative} />
        <CreatureEditorPassivePerception
          defaultPassivePerception={resource.passive_perception}
        />
        <CreatureEditorSpeedWalk defaultSpeedWalk={resource.speed_walk ?? 0} />
      </HStack>

      {/* Speed */}
      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorSpeedFly defaultSpeedFly={resource.speed_fly ?? 0} />
        <CreatureEditorSpeedSwim defaultSpeedSwim={resource.speed_swim ?? 0} />
        <CreatureEditorSpeedClimb
          defaultSpeedClimb={resource.speed_climb ?? 0}
        />
        <CreatureEditorSpeedBurrow
          defaultSpeedBurrow={resource.speed_burrow ?? 0}
        />
      </HStack>

      {/* Ability Scores */}
      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorAbilityStr defaultAbilityStr={resource.ability_str} />
        <CreatureEditorAbilityDex defaultAbilityDex={resource.ability_dex} />
        <CreatureEditorAbilityCon defaultAbilityCon={resource.ability_con} />
        <CreatureEditorAbilityInt defaultAbilityInt={resource.ability_int} />
        <CreatureEditorAbilityWis defaultAbilityWis={resource.ability_wis} />
        <CreatureEditorAbilityCha defaultAbilityCha={resource.ability_cha} />
      </HStack>

      {/* Proficiencies */}
      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorAbilityProficiencies
          defaultAbilityProficiencies={resource.ability_proficiencies}
        />
        <CreatureEditorSkillProficiencies
          defaultSkillProficiencies={resource.skill_proficiencies}
        />
        <CreatureEditorSkillExpertise
          defaultSkillExpertise={resource.skill_expertise}
        />
      </HStack>

      {/* Damage Interactions */}
      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorDamageImmunities
          defaultDamageImmunities={resource.damage_immunities}
        />
        <CreatureEditorDamageResistances
          defaultDamageResistances={resource.damage_resistances}
        />
        <CreatureEditorDamageVulnerabilities
          defaultDamageVulnerabilities={resource.damage_vulnerabilities}
        />
      </HStack>

      {/* Condition Interactions */}
      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorConditionImmunities
          defaultConditionImmunities={resource.condition_immunities}
        />
        <CreatureEditorConditionResistances
          defaultConditionResistances={resource.condition_resistances}
        />
        <CreatureEditorConditionVulnerabilities
          defaultConditionVulnerabilities={resource.condition_vulnerabilities}
        />
      </HStack>

      {/* Senses */}
      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorBlindsight defaultBlindsight={resource.blindsight} />
        <CreatureEditorDarkvision defaultDarkvision={resource.darkvision} />
        <CreatureEditorTremorsense defaultTremorsense={resource.tremorsense} />
        <CreatureEditorTruesight defaultTruesight={resource.truesight} />
      </HStack>

      {/* Descriptive Fields */}
      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorSenses defaultSenses={resource.senses[lang] ?? ""} />
        <CreatureEditorLanguages
          defaultLanguages={resource.languages[lang] ?? ""}
        />
      </HStack>
      <CreatureEditorGear campaignId={campaignId} defaultGear={resource.gear} />

      {/* Actions and Traits */}
      <CreatureEditorTraits defaultTraits={resource.traits[lang] ?? ""} />
      <CreatureEditorActions defaultActions={resource.actions[lang] ?? ""} />
      <CreatureEditorBonusActions
        defaultBonusActions={resource.bonus_actions[lang] ?? ""}
      />
      <CreatureEditorReactions
        defaultReactions={resource.reactions[lang] ?? ""}
      />
      <CreatureEditorLegendaryActions
        defaultLegendaryActions={resource.legendary_actions[lang] ?? ""}
      />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Ability - Cha
//------------------------------------------------------------------------------

function CreatureEditorAbilityCha({
  defaultAbilityCha,
}: {
  defaultAbilityCha: number;
}) {
  const { error, ...rest } = useCreatureEditorFormAbilityCha(defaultAbilityCha);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("ability_cha.label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Ability - Con
//------------------------------------------------------------------------------

function CreatureEditorAbilityCon({
  defaultAbilityCon,
}: {
  defaultAbilityCon: number;
}) {
  const { error, ...rest } = useCreatureEditorFormAbilityCon(defaultAbilityCon);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("ability_con.label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Ability - Dex
//------------------------------------------------------------------------------

function CreatureEditorAbilityDex({
  defaultAbilityDex,
}: {
  defaultAbilityDex: number;
}) {
  const { error, ...rest } = useCreatureEditorFormAbilityDex(defaultAbilityDex);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("ability_dex.label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Ability - Int
//------------------------------------------------------------------------------

function CreatureEditorAbilityInt({
  defaultAbilityInt,
}: {
  defaultAbilityInt: number;
}) {
  const { error, ...rest } = useCreatureEditorFormAbilityInt(defaultAbilityInt);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("ability_int.label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Ability - Str
//------------------------------------------------------------------------------

function CreatureEditorAbilityStr({
  defaultAbilityStr,
}: {
  defaultAbilityStr: number;
}) {
  const { error, ...rest } = useCreatureEditorFormAbilityStr(defaultAbilityStr);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("ability_str.label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Ability - Wis
//------------------------------------------------------------------------------

function CreatureEditorAbilityWis({
  defaultAbilityWis,
}: {
  defaultAbilityWis: number;
}) {
  const { error, ...rest } = useCreatureEditorFormAbilityWis(defaultAbilityWis);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("ability_wis.label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// AC
//------------------------------------------------------------------------------

function CreatureEditorAC({ defaultAC }: { defaultAC: number }) {
  const { error, ...rest } = useCreatureEditorFormAC(defaultAC);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("ac.label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Alignment
//------------------------------------------------------------------------------

function CreatureEditorAlignment({
  defaultAlignment,
}: {
  defaultAlignment: Creature["alignment"];
}) {
  const alignmentOptions = useCreatureAlignmentOptions();
  const { error, ...rest } = useCreatureEditorFormAlignment(defaultAlignment);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("alignment.label")}>
      <Select options={alignmentOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Blindsight
//------------------------------------------------------------------------------

function CreatureEditorBlindsight({
  defaultBlindsight,
}: {
  defaultBlindsight: number;
}) {
  const { error, ...rest } = useCreatureEditorFormBlindsight(defaultBlindsight);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("senses[blindsight].label")}>
      <DistanceInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Condition Immunities
//------------------------------------------------------------------------------

function CreatureEditorConditionImmunities({
  defaultConditionImmunities,
}: {
  defaultConditionImmunities: Creature["condition_immunities"];
}) {
  const conditionOptions = useCreatureConditionOptions();
  const { error, ...rest } = useCreatureEditorFormConditionImmunities(
    defaultConditionImmunities,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("condition_immunities.label")}>
      <Select
        multiple
        options={conditionOptions}
        placeholder={t("condition_immunities.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Condition Resistances
//------------------------------------------------------------------------------

function CreatureEditorConditionResistances({
  defaultConditionResistances,
}: {
  defaultConditionResistances: Creature["condition_resistances"];
}) {
  const conditionOptions = useCreatureConditionOptions();
  const { error, ...rest } = useCreatureEditorFormConditionResistances(
    defaultConditionResistances,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("condition_resistances.label")}>
      <Select
        multiple
        options={conditionOptions}
        placeholder={t("condition_resistances.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Condition Vulnerabilities
//------------------------------------------------------------------------------

function CreatureEditorConditionVulnerabilities({
  defaultConditionVulnerabilities,
}: {
  defaultConditionVulnerabilities: Creature["condition_vulnerabilities"];
}) {
  const conditionOptions = useCreatureConditionOptions();
  const { error, ...rest } = useCreatureEditorFormConditionVulnerabilities(
    defaultConditionVulnerabilities,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("condition_vulnerabilities.label")}>
      <Select
        multiple
        options={conditionOptions}
        placeholder={t("condition_vulnerabilities.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// CR
//------------------------------------------------------------------------------

function CreatureEditorCR({ defaultCR }: { defaultCR: number }) {
  const { error, ...rest } = useCreatureEditorFormCR(defaultCR);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("cr.label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Damage Immunities
//------------------------------------------------------------------------------

function CreatureEditorDamageImmunities({
  defaultDamageImmunities,
}: {
  defaultDamageImmunities: Creature["damage_immunities"];
}) {
  const damageTypeOptions = useDamageTypeOptions();
  const { error, ...rest } = useCreatureEditorFormDamageImmunities(
    defaultDamageImmunities,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("damage_immunities.label")}>
      <Select
        multiple
        options={damageTypeOptions}
        placeholder={t("damage_immunities.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Damage Resistances
//------------------------------------------------------------------------------

function CreatureEditorDamageResistances({
  defaultDamageResistances,
}: {
  defaultDamageResistances: Creature["damage_resistances"];
}) {
  const damageTypeOptions = useDamageTypeOptions();
  const { error, ...rest } = useCreatureEditorFormDamageResistances(
    defaultDamageResistances,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("damage_resistances.label")}>
      <Select
        multiple
        options={damageTypeOptions}
        placeholder={t("damage_resistances.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Damage Vulnerabilities
//------------------------------------------------------------------------------

function CreatureEditorDamageVulnerabilities({
  defaultDamageVulnerabilities,
}: {
  defaultDamageVulnerabilities: Creature["damage_vulnerabilities"];
}) {
  const damageTypeOptions = useDamageTypeOptions();
  const { error, ...rest } = useCreatureEditorFormDamageVulnerabilities(
    defaultDamageVulnerabilities,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("damage_vulnerabilities.label")}>
      <Select
        multiple
        options={damageTypeOptions}
        placeholder={t("damage_vulnerabilities.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Darkvision
//------------------------------------------------------------------------------

function CreatureEditorDarkvision({
  defaultDarkvision,
}: {
  defaultDarkvision: number;
}) {
  const { error, ...rest } = useCreatureEditorFormDarkvision(defaultDarkvision);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("senses[darkvision].label")}>
      <DistanceInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Features - Actions
//------------------------------------------------------------------------------

function CreatureEditorActions({ defaultActions }: { defaultActions: string }) {
  const { error, ...rest } = useCreatureEditorFormActions(defaultActions);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("actions.label")}>
      <Textarea
        bgColor="bg.info"
        placeholder={t("actions.placeholder")}
        rows={5}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Features - Bonus Actions
//------------------------------------------------------------------------------

function CreatureEditorBonusActions({
  defaultBonusActions,
}: {
  defaultBonusActions: string;
}) {
  const { error, ...rest } =
    useCreatureEditorFormBonusActions(defaultBonusActions);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("bonus_actions.label")}>
      <Textarea
        bgColor="bg.info"
        placeholder={t("bonus_actions.placeholder")}
        rows={5}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Features - Legendary Actions
//------------------------------------------------------------------------------

function CreatureEditorLegendaryActions({
  defaultLegendaryActions,
}: {
  defaultLegendaryActions: string;
}) {
  const { error, ...rest } = useCreatureEditorFormLegendaryActions(
    defaultLegendaryActions,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("legendary_actions.label")}>
      <Textarea
        bgColor="bg.info"
        placeholder={t("legendary_actions.placeholder")}
        rows={5}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Features - Reactions
//------------------------------------------------------------------------------

function CreatureEditorReactions({
  defaultReactions,
}: {
  defaultReactions: string;
}) {
  const { error, ...rest } = useCreatureEditorFormReactions(defaultReactions);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("reactions.label")}>
      <Textarea
        bgColor="bg.info"
        placeholder={t("reactions.placeholder")}
        rows={5}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Features - Traits
//------------------------------------------------------------------------------

function CreatureEditorTraits({ defaultTraits }: { defaultTraits: string }) {
  const { error, ...rest } = useCreatureEditorFormTraits(defaultTraits);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("traits.label")}>
      <Textarea
        bgColor="bg.info"
        placeholder={t("traits.placeholder")}
        rows={5}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Gear
//------------------------------------------------------------------------------

function CreatureEditorGear({
  campaignId,
  defaultGear,
}: {
  campaignId: string;
  defaultGear: EquipmentBundle;
}) {
  const { error, ...rest } = useCreatureEditorFormGear(defaultGear);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("gear.label")}>
      <EquipmentBundleEditor campaignId={campaignId} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Habitat
//------------------------------------------------------------------------------

function CreatureEditorHabitats({
  defaultHabitat,
}: {
  defaultHabitat: Creature["habitats"];
}) {
  const habitatOptions = useCreatureHabitatOptions();
  const { error, ...rest } = useCreatureEditorFormHabitats(defaultHabitat);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("habitats.label")}>
      <Select
        multiple
        options={habitatOptions}
        placeholder={t("habitats.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// HP
//------------------------------------------------------------------------------

function CreatureEditorHP({ defaultHP }: { defaultHP: number }) {
  const { error, ...rest } = useCreatureEditorFormHP(defaultHP);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("hp.label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// HP Formula
//------------------------------------------------------------------------------

function CreatureEditorHPFormula({
  defaultHPFormula,
}: {
  defaultHPFormula: string;
}) {
  const { error, ...rest } = useCreatureEditorFormHPFormula(defaultHPFormula);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("hp_formula.label")}>
      <Input
        autoComplete="off"
        placeholder={t("hp_formula.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Initiative
//------------------------------------------------------------------------------

function CreatureEditorInitiative({
  defaultInitiative,
}: {
  defaultInitiative: number;
}) {
  const { error, ...rest } = useCreatureEditorFormInitiative(defaultInitiative);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("initiative.label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Languages
//------------------------------------------------------------------------------

function CreatureEditorLanguages({
  defaultLanguages,
}: {
  defaultLanguages: string;
}) {
  const { error, ...rest } = useCreatureEditorFormLanguages(defaultLanguages);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("languages.label")}>
      <Input
        bgColor="bg.info"
        placeholder={t("languages.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function CreatureEditorName({ defaultName }: { defaultName: string }) {
  const { error, ...rest } = useCreatureEditorFormName(defaultName);
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

function CreatureEditorPage({ defaultPage }: { defaultPage: number }) {
  const { error, ...rest } = useCreatureEditorFormPage(defaultPage);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("page.label")} maxW="6em">
      <NumberInput bgColor="bg.info" {...rest} w="6em" />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Passive Perception
//------------------------------------------------------------------------------

function CreatureEditorPassivePerception({
  defaultPassivePerception,
}: {
  defaultPassivePerception: number;
}) {
  const { error, ...rest } = useCreatureEditorFormPassivePerception(
    defaultPassivePerception,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("passive_perception.label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Planes
//------------------------------------------------------------------------------

function CreatureEditorPlanes({ defaultPlanes }: { defaultPlanes: string }) {
  const { error, ...rest } = useCreatureEditorFormPlanes(defaultPlanes);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("planes.label")}>
      <Input placeholder={t("planes.placeholder")} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Proficiencies - Ability Proficiencies
//------------------------------------------------------------------------------

function CreatureEditorAbilityProficiencies({
  defaultAbilityProficiencies,
}: {
  defaultAbilityProficiencies: Creature["ability_proficiencies"];
}) {
  const abilityOptions = useCreatureAbilityOptions();
  const { error, ...rest } = useCreatureEditorFormAbilityProficiencies(
    defaultAbilityProficiencies,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("ability_proficiencies.label")}>
      <Select
        multiple
        options={abilityOptions}
        placeholder={t("ability_proficiencies.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Proficiencies - Skill Expertise
//------------------------------------------------------------------------------

function CreatureEditorSkillExpertise({
  defaultSkillExpertise,
}: {
  defaultSkillExpertise: Creature["skill_expertise"];
}) {
  const skillOptions = useCreatureSkillOptions();
  const { error, ...rest } = useCreatureEditorFormSkillExpertise(
    defaultSkillExpertise,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("skill_expertise.label")}>
      <Select
        multiple
        options={skillOptions}
        placeholder={t("skill_expertise.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Proficiencies - Skill Proficiencies
//------------------------------------------------------------------------------

function CreatureEditorSkillProficiencies({
  defaultSkillProficiencies,
}: {
  defaultSkillProficiencies: Creature["skill_proficiencies"];
}) {
  const skillOptions = useCreatureSkillOptions();
  const { error, ...rest } = useCreatureEditorFormSkillProficiencies(
    defaultSkillProficiencies,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("skill_proficiencies.label")}>
      <Select
        multiple
        options={skillOptions}
        placeholder={t("skill_proficiencies.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Senses
//------------------------------------------------------------------------------

function CreatureEditorSenses({ defaultSenses }: { defaultSenses: string }) {
  const { error, ...rest } = useCreatureEditorFormSenses(defaultSenses);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("senses.label")}>
      <Input
        bgColor="bg.info"
        placeholder={t("senses.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Size
//------------------------------------------------------------------------------

function CreatureEditorSize({
  defaultSize,
}: {
  defaultSize: Creature["size"];
}) {
  const sizeOptions = useCreatureSizeOptions();
  const { error, ...rest } = useCreatureEditorFormSize(defaultSize);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("size.label")}>
      <Select options={sizeOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Speed - Burrow
//------------------------------------------------------------------------------

function CreatureEditorSpeedBurrow({
  defaultSpeedBurrow,
}: {
  defaultSpeedBurrow: number;
}) {
  const { error, ...rest } =
    useCreatureEditorFormSpeedBurrow(defaultSpeedBurrow);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("speed_burrow.label")}>
      <DistanceInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Speed - Climb
//------------------------------------------------------------------------------

function CreatureEditorSpeedClimb({
  defaultSpeedClimb,
}: {
  defaultSpeedClimb: number;
}) {
  const { error, ...rest } = useCreatureEditorFormSpeedClimb(defaultSpeedClimb);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("speed_climb.label")}>
      <DistanceInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Speed - Fly
//------------------------------------------------------------------------------

function CreatureEditorSpeedFly({
  defaultSpeedFly,
}: {
  defaultSpeedFly: number;
}) {
  const { error, ...rest } = useCreatureEditorFormSpeedFly(defaultSpeedFly);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("speed_fly.label")}>
      <DistanceInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Speed - Swim
//------------------------------------------------------------------------------

function CreatureEditorSpeedSwim({
  defaultSpeedSwim,
}: {
  defaultSpeedSwim: number;
}) {
  const { error, ...rest } = useCreatureEditorFormSpeedSwim(defaultSpeedSwim);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("speed_swim.label")}>
      <DistanceInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Speed - Walk
//------------------------------------------------------------------------------

function CreatureEditorSpeedWalk({
  defaultSpeedWalk,
}: {
  defaultSpeedWalk: number;
}) {
  const { error, ...rest } = useCreatureEditorFormSpeedWalk(defaultSpeedWalk);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("speed_walk.label")}>
      <DistanceInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Treasures
//------------------------------------------------------------------------------

function CreatureEditorTreasures({
  defaultTreasures,
}: {
  defaultTreasures: Creature["treasures"];
}) {
  const treasureOptions = useCreatureTreasureOptions();

  const { error, ...rest } = useCreatureEditorFormTreasures(defaultTreasures);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("treasures.label")}>
      <Select
        multiple
        options={treasureOptions}
        placeholder={t("treasures.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Tremorsense
//------------------------------------------------------------------------------

function CreatureEditorTremorsense({
  defaultTremorsense,
}: {
  defaultTremorsense: number;
}) {
  const { error, ...rest } =
    useCreatureEditorFormTremorsense(defaultTremorsense);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("senses[tremorsense].label")}>
      <DistanceInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Truesight
//------------------------------------------------------------------------------

function CreatureEditorTruesight({
  defaultTruesight,
}: {
  defaultTruesight: number;
}) {
  const { error, ...rest } = useCreatureEditorFormTruesight(defaultTruesight);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("senses[truesight].label")}>
      <DistanceInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Type
//------------------------------------------------------------------------------

function CreatureEditorType({
  defaultType,
}: {
  defaultType: Creature["type"];
}) {
  const typeOptions = useCreatureTypeOptions();
  const { error, ...rest } = useCreatureEditorFormType(defaultType);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("type.label")}>
      <Select options={typeOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

function CreatureEditorVisibility({
  defaultVisibility,
}: {
  defaultVisibility: Creature["visibility"];
}) {
  const visibilityOptions = useCampaignRoleOptions();
  const { error, ...rest } = useCreatureEditorFormVisibility(defaultVisibility);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("visibility.label")} maxW="10em">
      <Select options={visibilityOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "ability_cha.label": {
    en: "Charisma",
    it: "Carisma",
  },
  "ability_con.label": {
    en: "Constitution",
    it: "Costituzione",
  },
  "ability_dex.label": {
    en: "Dexterity",
    it: "Destrezza",
  },
  "ability_int.label": {
    en: "Intelligence",
    it: "Intelligenza",
  },
  "ability_proficiencies.label": {
    en: "Saving Throws Proficiencies",
    it: "Competenze Tiri Salvezza",
  },
  "ability_proficiencies.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "ability_str.label": {
    en: "Strength",
    it: "Forza",
  },
  "ability_wis.label": {
    en: "Wisdom",
    it: "Saggezza",
  },
  "ac.label": {
    en: "Armor Class",
    it: "Classe Armatura",
  },
  "ac.placeholder": {
    en: "E.g.: 15 (natural armor)",
    it: "Es: 15 (armatura naturale)",
  },
  "actions.label": {
    en: "Actions",
    it: "Azioni",
  },
  "actions.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "alignment.label": {
    en: "Alignment",
    it: "Allineamento",
  },
  "bonus_actions.label": {
    en: "Bonus Actions",
    it: "Azioni Bonus",
  },
  "bonus_actions.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "condition_immunities.label": {
    en: "Condition Immunities",
    it: "Immunità alle Condizioni",
  },
  "condition_immunities.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "condition_resistances.label": {
    en: "Condition Resistances",
    it: "Resistenze alle Condizioni",
  },
  "condition_resistances.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "condition_vulnerabilities.label": {
    en: "Condition Vulnerabilities",
    it: "Vulnerabilità alle Condizioni",
  },
  "condition_vulnerabilities.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "cr.label": {
    en: "Challenge Rating",
    it: "Grado Sfida",
  },
  "damage_immunities.label": {
    en: "Damage Immunities",
    it: "Immunità ai Danni",
  },
  "damage_immunities.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "damage_resistances.label": {
    en: "Damage Resistances",
    it: "Resistenze ai Danni",
  },
  "damage_resistances.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "damage_vulnerabilities.label": {
    en: "Damage Vulnerabilities",
    it: "Vulnerabilità ai Danni",
  },
  "damage_vulnerabilities.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "gear.label": {
    en: "Gear",
    it: "Attrezzatura",
  },
  "gear.placeholder": {
    en: "None",
    it: "Nessuno",
  },
  "habitats.label": {
    en: "Habitat",
    it: "Habitat",
  },
  "habitats.placeholder": {
    en: "None",
    it: "Nessuno",
  },
  "hp.label": {
    en: "Hit Points",
    it: "Punti Ferita",
  },
  "hp.placeholder": {
    en: "E.g.: 52",
    it: "Es: 52",
  },
  "hp_formula.label": {
    en: "HP Formula",
    it: "Formula PF",
  },
  "hp_formula.placeholder": {
    en: "E.g.: 8d8 + 16",
    it: "Es: 8d8 + 16",
  },
  "initiative.label": {
    en: "Initiative",
    it: "Iniziativa",
  },
  "initiative.placeholder": {
    en: "E.g.: +2",
    it: "Es: +2",
  },
  "initiative_passive.label": {
    en: "Passive Initiative",
    it: "Iniziativa Passiva",
  },
  "initiative_passive.placeholder": {
    en: "E.g.: 11",
    it: "Es: 11",
  },
  "languages.label": {
    en: "Languages",
    it: "Lingue",
  },
  "languages.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "legendary_actions.label": {
    en: "Legendary Actions",
    it: "Azioni Leggendarie",
  },
  "legendary_actions.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "name.error.empty": {
    en: "Name is required",
    it: "Il nome è obbligatorio",
  },
  "name.label": {
    en: "Name",
    it: "Nome",
  },
  "name.placeholder": {
    en: "E.g.: Arch Hag",
    it: "Es: Signora delle Megere",
  },
  "page.label": {
    en: "Page",
    it: "Pagina",
  },
  "passive_perception.label": {
    en: "Passive Perception",
    it: "Percezione Passiva",
  },
  "passive_perception.placeholder": {
    en: "E.g.: 12",
    it: "Es: 12",
  },
  "planes.label": {
    en: "Planes",
    it: "Piani",
  },
  "planes.placeholder": {
    en: "None",
    it: "Nessuno",
  },
  "reactions.label": {
    en: "Reactions",
    it: "Reazioni",
  },
  "reactions.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "senses.label": {
    en: "Other Senses",
    it: "Altri Sensi",
  },
  "senses.placeholder": {
    en: "None",
    it: "Nessuno",
  },
  "senses[blindsight].label": {
    en: "Blindsight",
    it: "Vista Cieca",
  },
  "senses[darkvision].label": {
    en: "Darkvision",
    it: "Scurovisione",
  },
  "senses[tremorsense].label": {
    en: "Tremorsense",
    it: "Percezione Tellurica",
  },
  "senses[truesight].label": {
    en: "Truesight",
    it: "Vista Pura",
  },
  "size.label": {
    en: "Size",
    it: "Taglia",
  },
  "skill_expertise.label": {
    en: "Skill Expertise",
    it: "Maestrie nelle Abilità",
  },
  "skill_expertise.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "skill_proficiencies.label": {
    en: "Skill Proficiencies",
    it: "Competenze nelle Abilità",
  },
  "skill_proficiencies.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "speed.placeholder": {
    en: "In squares",
    it: "In quadretti",
  },
  "speed_burrow.label": {
    en: "Burrow",
    it: "Scavo",
  },
  "speed_climb.label": {
    en: "Climb",
    it: "Scalare",
  },
  "speed_fly.label": {
    en: "Fly",
    it: "Volare",
  },
  "speed_swim.label": {
    en: "Swim",
    it: "Nuotare",
  },
  "speed_walk.label": {
    en: "Speed",
    it: "Velocità",
  },
  "traits.label": {
    en: "Traits",
    it: "Tratti",
  },
  "traits.placeholder": {
    en: "None",
    it: "Nessuno",
  },
  "treasures.label": {
    en: "Treasures",
    it: "Tesori",
  },
  "treasures.placeholder": {
    en: "None",
    it: "Nessuno",
  },
  "type.label": {
    en: "Type",
    it: "Tipo",
  },
  "visibility.label": {
    en: "Visibility",
    it: "Visibilità",
  },
};
