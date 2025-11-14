import { HStack, VStack } from "@chakra-ui/react";
import useListCollection from "../../../../../../hooks/use-list-collection";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import { type Creature } from "../../../../../../resources/creatures/creature";
import { useCampaignRoleOptions } from "../../../../../../resources/types/campaign-role";
import { useCreatureAbilityOptions } from "../../../../../../resources/types/creature-ability";
import { useCreatureAlignmentOptions } from "../../../../../../resources/types/creature-alignment";
import { useCreatureConditionOptions } from "../../../../../../resources/types/creature-condition";
import { useCreatureHabitatOptions } from "../../../../../../resources/types/creature-habitat";
import { useCreatureSizeOptions } from "../../../../../../resources/types/creature-size";
import { useCreatureSkillOptions } from "../../../../../../resources/types/creature-skill";
import { useCreatureTreasureOptions } from "../../../../../../resources/types/creature-treasure";
import { useCreatureTypeOptions } from "../../../../../../resources/types/creature-type";
import { useDamageTypeOptions } from "../../../../../../resources/types/damage-type";
import Field from "../../../../../../ui/field";
import Input from "../../../../../../ui/input";
import NumberInput from "../../../../../../ui/number-input";
import Select from "../../../../../../ui/select";
import Textarea from "../../../../../../ui/textarea";
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
  useCreatureEditorFormBonusActions,
  useCreatureEditorFormCR,
  useCreatureEditorFormConditionImmunities,
  useCreatureEditorFormConditionResistances,
  useCreatureEditorFormConditionVulnerabilities,
  useCreatureEditorFormDamageImmunities,
  useCreatureEditorFormDamageResistances,
  useCreatureEditorFormDamageVulnerabilities,
  useCreatureEditorFormGear,
  useCreatureEditorFormHP,
  useCreatureEditorFormHPFormula,
  useCreatureEditorFormHabitats,
  useCreatureEditorFormInitiative,
  useCreatureEditorFormInitiativePassive,
  useCreatureEditorFormLanguages,
  useCreatureEditorFormLegendaryActions,
  useCreatureEditorFormName,
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
  useCreatureEditorFormType,
  useCreatureEditorFormVisibility,
} from "./creature-editor-form";

//------------------------------------------------------------------------------
// Creature Editor
//------------------------------------------------------------------------------

export type CreatureEditorProps = {
  resource: Creature;
};

export default function CreatureEditor({ resource }: CreatureEditorProps) {
  const { lang } = useI18nLangContext(i18nContext);

  return (
    <VStack gap={4} w="full">
      {/* Basic Information */}
      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorName defaultName={resource.name[lang] ?? ""} />
        <CreatureEditorVisibility defaultVisibility={resource.visibility} />
        <CreatureEditorCR defaultCR={resource.cr} />
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
        <CreatureEditorAC defaultAC={resource.ac} />
        <CreatureEditorHP defaultHP={resource.hp} />
        <CreatureEditorHPFormula defaultHPFormula={resource.hp_formula} />
      </HStack>

      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorInitiative defaultInitiative={resource.initiative} />
        <CreatureEditorInitiativePassive
          defaultInitiativePassive={resource.initiative_passive}
        />
        <CreatureEditorPassivePerception
          defaultPassivePerception={resource.passive_perception}
        />
      </HStack>

      {/* Speed */}
      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorSpeedWalk defaultSpeedWalk={resource.speed_walk ?? ""} />
        <CreatureEditorSpeedFly defaultSpeedFly={resource.speed_fly ?? ""} />
        <CreatureEditorSpeedSwim defaultSpeedSwim={resource.speed_swim ?? ""} />
        <CreatureEditorSpeedClimb
          defaultSpeedClimb={resource.speed_climb ?? ""}
        />
        <CreatureEditorSpeedBurrow
          defaultSpeedBurrow={resource.speed_burrow ?? ""}
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

      {/* Descriptive Fields */}
      <CreatureEditorGear defaultGear={resource.gear[lang] ?? ""} />
      <HStack align="flex-start" gap={4} w="full">
        <CreatureEditorLanguages
          defaultLanguages={resource.languages[lang] ?? ""}
        />
        <CreatureEditorSenses defaultSenses={resource.senses[lang] ?? ""} />
      </HStack>

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
// Name
//------------------------------------------------------------------------------

function CreatureEditorName({ defaultName }: { defaultName: string }) {
  const { error, ...rest } = useCreatureEditorFormName(defaultName);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("name.label")}>
      <Input autoComplete="off" placeholder={t("name.placeholder")} {...rest} />
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
  const visibilityOptions = useListCollection(useCampaignRoleOptions());
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
// CR
//------------------------------------------------------------------------------

function CreatureEditorCR({ defaultCR }: { defaultCR: number }) {
  const { error, ...rest } = useCreatureEditorFormCR(defaultCR);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} flex={0} label={t("cr.label")}>
      <NumberInput {...rest} inputProps={{ w: "5em" }} />
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
  const typeOptions = useListCollection(useCreatureTypeOptions());
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
// Size
//------------------------------------------------------------------------------

function CreatureEditorSize({
  defaultSize,
}: {
  defaultSize: Creature["size"];
}) {
  const sizeOptions = useListCollection(useCreatureSizeOptions());
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
// Alignment
//------------------------------------------------------------------------------

function CreatureEditorAlignment({
  defaultAlignment,
}: {
  defaultAlignment: Creature["alignment"];
}) {
  const alignmentOptions = useListCollection(useCreatureAlignmentOptions());
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
// Habitat
//------------------------------------------------------------------------------

function CreatureEditorHabitats({
  defaultHabitat,
}: {
  defaultHabitat: Creature["habitats"];
}) {
  const habitatOptions = useListCollection(useCreatureHabitatOptions());
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
// Treasures
//------------------------------------------------------------------------------

function CreatureEditorTreasures({
  defaultTreasures,
}: {
  defaultTreasures: Creature["treasures"];
}) {
  const treasureOptions = useListCollection(useCreatureTreasureOptions());

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
// AC
//------------------------------------------------------------------------------

function CreatureEditorAC({ defaultAC }: { defaultAC: string }) {
  const { error, ...rest } = useCreatureEditorFormAC(defaultAC);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("ac.label")}>
      <Input autoComplete="off" placeholder={t("ac.placeholder")} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// HP
//------------------------------------------------------------------------------

function CreatureEditorHP({ defaultHP }: { defaultHP: string }) {
  const { error, ...rest } = useCreatureEditorFormHP(defaultHP);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("hp.label")}>
      <Input autoComplete="off" placeholder={t("hp.placeholder")} {...rest} />
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
  defaultInitiative: string;
}) {
  const { error, ...rest } = useCreatureEditorFormInitiative(defaultInitiative);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("initiative.label")}>
      <Input
        autoComplete="off"
        placeholder={t("initiative.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Initiative Passive
//------------------------------------------------------------------------------

function CreatureEditorInitiativePassive({
  defaultInitiativePassive,
}: {
  defaultInitiativePassive: string;
}) {
  const { error, ...rest } = useCreatureEditorFormInitiativePassive(
    defaultInitiativePassive,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("initiative_passive.label")}>
      <Input
        autoComplete="off"
        placeholder={t("initiative_passive.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Passive Perception
//------------------------------------------------------------------------------

function CreatureEditorPassivePerception({
  defaultPassivePerception,
}: {
  defaultPassivePerception: string;
}) {
  const { error, ...rest } = useCreatureEditorFormPassivePerception(
    defaultPassivePerception,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("passive_perception.label")}>
      <Input
        autoComplete="off"
        placeholder={t("passive_perception.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Speed Walk
//------------------------------------------------------------------------------

function CreatureEditorSpeedWalk({
  defaultSpeedWalk,
}: {
  defaultSpeedWalk: string;
}) {
  const { error, ...rest } = useCreatureEditorFormSpeedWalk(defaultSpeedWalk);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("speed_walk.label")}>
      <Input
        autoComplete="off"
        placeholder={t("speed.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Speed Fly
//------------------------------------------------------------------------------

function CreatureEditorSpeedFly({
  defaultSpeedFly,
}: {
  defaultSpeedFly: string;
}) {
  const { error, ...rest } = useCreatureEditorFormSpeedFly(defaultSpeedFly);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("speed_fly.label")}>
      <Input
        autoComplete="off"
        placeholder={t("speed.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Speed Swim
//------------------------------------------------------------------------------

function CreatureEditorSpeedSwim({
  defaultSpeedSwim,
}: {
  defaultSpeedSwim: string;
}) {
  const { error, ...rest } = useCreatureEditorFormSpeedSwim(defaultSpeedSwim);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("speed_swim.label")}>
      <Input
        autoComplete="off"
        placeholder={t("speed.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Speed Climb
//------------------------------------------------------------------------------

function CreatureEditorSpeedClimb({
  defaultSpeedClimb,
}: {
  defaultSpeedClimb: string;
}) {
  const { error, ...rest } = useCreatureEditorFormSpeedClimb(defaultSpeedClimb);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("speed_climb.label")}>
      <Input
        autoComplete="off"
        placeholder={t("speed.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Speed Burrow
//------------------------------------------------------------------------------

function CreatureEditorSpeedBurrow({
  defaultSpeedBurrow,
}: {
  defaultSpeedBurrow: string;
}) {
  const { error, ...rest } =
    useCreatureEditorFormSpeedBurrow(defaultSpeedBurrow);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("speed_burrow.label")}>
      <Input
        autoComplete="off"
        placeholder={t("speed.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Ability Scores
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
// Ability Proficiencies
//------------------------------------------------------------------------------

function CreatureEditorAbilityProficiencies({
  defaultAbilityProficiencies,
}: {
  defaultAbilityProficiencies: Creature["ability_proficiencies"];
}) {
  const abilityOptions = useListCollection(useCreatureAbilityOptions());
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
// Skill Expertise
//------------------------------------------------------------------------------

function CreatureEditorSkillExpertise({
  defaultSkillExpertise,
}: {
  defaultSkillExpertise: Creature["skill_expertise"];
}) {
  const skillOptions = useListCollection(useCreatureSkillOptions());
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
// Skill Proficiencies
//------------------------------------------------------------------------------

function CreatureEditorSkillProficiencies({
  defaultSkillProficiencies,
}: {
  defaultSkillProficiencies: Creature["skill_proficiencies"];
}) {
  const skillOptions = useListCollection(useCreatureSkillOptions());
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
// Damage Immunities
//------------------------------------------------------------------------------

function CreatureEditorDamageImmunities({
  defaultDamageImmunities,
}: {
  defaultDamageImmunities: Creature["damage_immunities"];
}) {
  const damageTypeOptions = useListCollection(useDamageTypeOptions());
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
  const damageTypeOptions = useListCollection(useDamageTypeOptions());
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
  const damageTypeOptions = useListCollection(useDamageTypeOptions());
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
// Condition Immunities
//------------------------------------------------------------------------------

function CreatureEditorConditionImmunities({
  defaultConditionImmunities,
}: {
  defaultConditionImmunities: Creature["condition_immunities"];
}) {
  const conditionOptions = useListCollection(useCreatureConditionOptions());
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
  const conditionOptions = useListCollection(useCreatureConditionOptions());
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
  const conditionOptions = useListCollection(useCreatureConditionOptions());
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
// Gear
//------------------------------------------------------------------------------

function CreatureEditorGear({ defaultGear }: { defaultGear: string }) {
  const { error, ...rest } = useCreatureEditorFormGear(defaultGear);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("gear.label")}>
      <Input placeholder={t("gear.placeholder")} {...rest} />
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
      <Input placeholder={t("languages.placeholder")} {...rest} />
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
      <Input placeholder={t("senses.placeholder")} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Traits
//------------------------------------------------------------------------------

function CreatureEditorTraits({ defaultTraits }: { defaultTraits: string }) {
  const { error, ...rest } = useCreatureEditorFormTraits(defaultTraits);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("traits.label")}>
      <Textarea placeholder={t("traits.placeholder")} rows={5} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Actions
//------------------------------------------------------------------------------

function CreatureEditorActions({ defaultActions }: { defaultActions: string }) {
  const { error, ...rest } = useCreatureEditorFormActions(defaultActions);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("actions.label")}>
      <Textarea placeholder={t("actions.placeholder")} rows={5} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Bonus Actions
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
        placeholder={t("bonus_actions.placeholder")}
        rows={5}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Reactions
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
      <Textarea placeholder={t("reactions.placeholder")} rows={5} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Legendary Actions
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
        placeholder={t("legendary_actions.placeholder")}
        rows={5}
        {...rest}
      />
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
    en: "Ability Proficiencies",
    it: "Caratteristiche - Competenze",
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
    en: "Describe actions...",
    it: "Descrivi le azioni...",
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
    en: "CR",
    it: "GS",
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
  "page.placeholder": {
    en: "E.g.: 42",
    it: "Es: 42",
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
    en: "Senses",
    it: "Sensi",
  },
  "senses.placeholder": {
    en: "None",
    it: "Nessuno",
  },
  "size.label": {
    en: "Size",
    it: "Taglia",
  },
  "skill_expertise.label": {
    en: "Skill Expertise",
    it: "Abilità - Maestrie",
  },
  "skill_expertise.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "skill_proficiencies.label": {
    en: "Skill Proficiencies",
    it: "Abilità - Competenze",
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
