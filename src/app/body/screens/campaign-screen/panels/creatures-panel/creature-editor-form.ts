import type { CampaignRole } from "../../../../../../resources/types/campaign-role";
import type { CreatureAbility } from "../../../../../../resources/types/creature-ability";
import type { CreatureAlignment } from "../../../../../../resources/types/creature-alignment";
import type { CreatureCondition } from "../../../../../../resources/types/creature-condition";
import type { CreatureHabitat } from "../../../../../../resources/types/creature-habitat";
import type { CreatureSize } from "../../../../../../resources/types/creature-size";
import type { CreatureSkill } from "../../../../../../resources/types/creature-skill";
import type { CreatureTreasure } from "../../../../../../resources/types/creature-treasure";
import type { CreatureType } from "../../../../../../resources/types/creature-type";
import type { DamageType } from "../../../../../../resources/types/damage-type";
import { createForm } from "../../../../../../utils/form";

//------------------------------------------------------------------------------
// Creature Editor Form Fields
//------------------------------------------------------------------------------

export type CreatureEditorFormFields = {
  // Translation fields
  actions: string;
  bonus_actions: string;
  gear: string;
  languages: string;
  legendary_actions: string;
  name: string;
  page: string;
  planes: string;
  reactions: string;
  senses: string;
  traits: string;

  // Resource fields
  ability_cha: number;
  ability_con: number;
  ability_dex: number;
  ability_int: number;
  ability_proficiencies: CreatureAbility[];
  ability_str: number;
  ability_wis: number;
  ac: string;
  alignment: CreatureAlignment;
  condition_immunities: CreatureCondition[];
  condition_resistances: CreatureCondition[];
  condition_vulnerabilities: CreatureCondition[];
  cr: number;
  damage_immunities: DamageType[];
  damage_resistances: DamageType[];
  damage_vulnerabilities: DamageType[];
  habitats: CreatureHabitat[];
  hp: string;
  hp_formula: string;
  initiative: string;
  passive_perception: string;
  size: CreatureSize;
  skill_proficiencies: CreatureSkill[];
  speed_burrow: string;
  speed_climb: string;
  speed_fly: string;
  speed_swim: string;
  speed_walk: string;
  treasures: CreatureTreasure[];
  type: CreatureType;
  visibility: CampaignRole;
};

//------------------------------------------------------------------------------
// Creature Editor Form
//------------------------------------------------------------------------------

const creatureEditorForm = createForm<CreatureEditorFormFields>();

export const { useField: useCreatureEditorFormField } = creatureEditorForm;

export default creatureEditorForm;

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function validateName(name: string) {
  return name ? undefined : "name.error.empty";
}

export const useCreatureEditorFormName = (defaultName: string) =>
  useCreatureEditorFormField("name", defaultName, validateName);

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

export const useCreatureEditorFormVisibility = (
  defaultVisibility: CampaignRole,
) => useCreatureEditorFormField("visibility", defaultVisibility);

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

export const useCreatureEditorFormPage = (defaultPage: string) =>
  useCreatureEditorFormField("page", defaultPage);

//------------------------------------------------------------------------------
// Type
//------------------------------------------------------------------------------

export const useCreatureEditorFormType = (defaultType: CreatureType) =>
  useCreatureEditorFormField("type", defaultType);

//------------------------------------------------------------------------------
// Size
//------------------------------------------------------------------------------

export const useCreatureEditorFormSize = (defaultSize: CreatureSize) =>
  useCreatureEditorFormField("size", defaultSize);

//------------------------------------------------------------------------------
// Alignment
//------------------------------------------------------------------------------

export const useCreatureEditorFormAlignment = (
  defaultAlignment: CreatureAlignment,
) => useCreatureEditorFormField("alignment", defaultAlignment);

//------------------------------------------------------------------------------
// CR
//------------------------------------------------------------------------------

export const useCreatureEditorFormCR = (defaultCR: number) =>
  useCreatureEditorFormField("cr", defaultCR);

//------------------------------------------------------------------------------
// Habitats
//------------------------------------------------------------------------------

export const useCreatureEditorFormHabitats = (
  defaultHabitats: CreatureHabitat[],
) => useCreatureEditorFormField("habitats", defaultHabitats);

//------------------------------------------------------------------------------
// Treasures
//------------------------------------------------------------------------------

export const useCreatureEditorFormTreasures = (
  defaultTreasures: CreatureTreasure[],
) => useCreatureEditorFormField("treasures", defaultTreasures);

//------------------------------------------------------------------------------
// AC
//------------------------------------------------------------------------------

export const useCreatureEditorFormAC = (defaultAC: string) =>
  useCreatureEditorFormField("ac", defaultAC);

//------------------------------------------------------------------------------
// HP
//------------------------------------------------------------------------------

export const useCreatureEditorFormHP = (defaultHP: string) =>
  useCreatureEditorFormField("hp", defaultHP);

//------------------------------------------------------------------------------
// HP Formula
//------------------------------------------------------------------------------

export const useCreatureEditorFormHPFormula = (defaultHPFormula: string) =>
  useCreatureEditorFormField("hp_formula", defaultHPFormula);

//------------------------------------------------------------------------------
// Initiative
//------------------------------------------------------------------------------

export const useCreatureEditorFormInitiative = (defaultInitiative: string) =>
  useCreatureEditorFormField("initiative", defaultInitiative);

//------------------------------------------------------------------------------
// Passive Perception
//------------------------------------------------------------------------------

export const useCreatureEditorFormPassivePerception = (
  defaultPassivePerception: string,
) => useCreatureEditorFormField("passive_perception", defaultPassivePerception);

//------------------------------------------------------------------------------
// Speed Walk
//------------------------------------------------------------------------------

export const useCreatureEditorFormSpeedWalk = (defaultSpeedWalk: string) =>
  useCreatureEditorFormField("speed_walk", defaultSpeedWalk);

//------------------------------------------------------------------------------
// Speed Fly
//------------------------------------------------------------------------------

export const useCreatureEditorFormSpeedFly = (defaultSpeedFly: string) =>
  useCreatureEditorFormField("speed_fly", defaultSpeedFly);

//------------------------------------------------------------------------------
// Speed Swim
//------------------------------------------------------------------------------

export const useCreatureEditorFormSpeedSwim = (defaultSpeedSwim: string) =>
  useCreatureEditorFormField("speed_swim", defaultSpeedSwim);

//------------------------------------------------------------------------------
// Speed Climb
//------------------------------------------------------------------------------

export const useCreatureEditorFormSpeedClimb = (defaultSpeedClimb: string) =>
  useCreatureEditorFormField("speed_climb", defaultSpeedClimb);

//------------------------------------------------------------------------------
// Speed Burrow
//------------------------------------------------------------------------------

export const useCreatureEditorFormSpeedBurrow = (defaultSpeedBurrow: string) =>
  useCreatureEditorFormField("speed_burrow", defaultSpeedBurrow);

//------------------------------------------------------------------------------
// Ability Scores
//------------------------------------------------------------------------------

export const useCreatureEditorFormAbilityStr = (defaultAbilityStr: number) =>
  useCreatureEditorFormField("ability_str", defaultAbilityStr);

export const useCreatureEditorFormAbilityDex = (defaultAbilityDex: number) =>
  useCreatureEditorFormField("ability_dex", defaultAbilityDex);

export const useCreatureEditorFormAbilityCon = (defaultAbilityCon: number) =>
  useCreatureEditorFormField("ability_con", defaultAbilityCon);

export const useCreatureEditorFormAbilityInt = (defaultAbilityInt: number) =>
  useCreatureEditorFormField("ability_int", defaultAbilityInt);

export const useCreatureEditorFormAbilityWis = (defaultAbilityWis: number) =>
  useCreatureEditorFormField("ability_wis", defaultAbilityWis);

export const useCreatureEditorFormAbilityCha = (defaultAbilityCha: number) =>
  useCreatureEditorFormField("ability_cha", defaultAbilityCha);

//------------------------------------------------------------------------------
// Proficiencies
//------------------------------------------------------------------------------

export const useCreatureEditorFormAbilityProficiencies = (
  defaultAbilityProficiencies: CreatureAbility[],
) =>
  useCreatureEditorFormField(
    "ability_proficiencies",
    defaultAbilityProficiencies,
  );

export const useCreatureEditorFormSkillProficiencies = (
  defaultSkillProficiencies: CreatureSkill[],
) =>
  useCreatureEditorFormField("skill_proficiencies", defaultSkillProficiencies);

//------------------------------------------------------------------------------
// Damage Interactions
//------------------------------------------------------------------------------

export const useCreatureEditorFormDamageImmunities = (
  defaultDamageImmunities: DamageType[],
) => useCreatureEditorFormField("damage_immunities", defaultDamageImmunities);

export const useCreatureEditorFormDamageResistances = (
  defaultDamageResistances: DamageType[],
) => useCreatureEditorFormField("damage_resistances", defaultDamageResistances);

export const useCreatureEditorFormDamageVulnerabilities = (
  defaultDamageVulnerabilities: DamageType[],
) =>
  useCreatureEditorFormField(
    "damage_vulnerabilities",
    defaultDamageVulnerabilities,
  );

//------------------------------------------------------------------------------
// Condition Interactions
//------------------------------------------------------------------------------

export const useCreatureEditorFormConditionImmunities = (
  defaultConditionImmunities: CreatureCondition[],
) =>
  useCreatureEditorFormField(
    "condition_immunities",
    defaultConditionImmunities,
  );

export const useCreatureEditorFormConditionResistances = (
  defaultConditionResistances: CreatureCondition[],
) =>
  useCreatureEditorFormField(
    "condition_resistances",
    defaultConditionResistances,
  );

export const useCreatureEditorFormConditionVulnerabilities = (
  defaultConditionVulnerabilities: CreatureCondition[],
) =>
  useCreatureEditorFormField(
    "condition_vulnerabilities",
    defaultConditionVulnerabilities,
  );

//------------------------------------------------------------------------------
// Descriptive Fields
//------------------------------------------------------------------------------

export const useCreatureEditorFormGear = (defaultGear: string) =>
  useCreatureEditorFormField("gear", defaultGear);

export const useCreatureEditorFormLanguages = (defaultLanguages: string) =>
  useCreatureEditorFormField("languages", defaultLanguages);

export const useCreatureEditorFormPlanes = (defaultPlanes: string) =>
  useCreatureEditorFormField("planes", defaultPlanes);

export const useCreatureEditorFormSenses = (defaultSenses: string) =>
  useCreatureEditorFormField("senses", defaultSenses);

export const useCreatureEditorFormTraits = (defaultTraits: string) =>
  useCreatureEditorFormField("traits", defaultTraits);

export const useCreatureEditorFormActions = (defaultActions: string) =>
  useCreatureEditorFormField("actions", defaultActions);

export const useCreatureEditorFormBonusActions = (
  defaultBonusActions: string,
) => useCreatureEditorFormField("bonus_actions", defaultBonusActions);

export const useCreatureEditorFormReactions = (defaultReactions: string) =>
  useCreatureEditorFormField("reactions", defaultReactions);

export const useCreatureEditorFormLegendaryActions = (
  defaultLegendaryActions: string,
) => useCreatureEditorFormField("legendary_actions", defaultLegendaryActions);
