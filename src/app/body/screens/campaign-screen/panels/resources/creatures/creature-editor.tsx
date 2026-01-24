import { HStack } from "@chakra-ui/react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { creatureTagStore } from "~/models/resources/creature-tags/creature-tag-store";
import { type Creature } from "~/models/resources/creatures/creature";
import type { CreatureFormData } from "~/models/resources/creatures/creature-form";
import { languageStore } from "~/models/resources/languages/language-store";
import { planeStore } from "~/models/resources/planes/plane-store";
import { useCreatureAbilityOptions } from "~/models/types/creature-ability";
import { useCreatureAlignmentOptions } from "~/models/types/creature-alignment";
import {
  parseCreatureChallengeRating,
  stringifyCreatureChallengeRating,
  useCreatureChallengeRatingOptions,
} from "~/models/types/creature-challenge-rating";
import { useCreatureConditionOptions } from "~/models/types/creature-condition";
import { useCreatureHabitatOptions } from "~/models/types/creature-habitat";
import { useCreatureSizeOptions } from "~/models/types/creature-size";
import { useCreatureSkillOptions } from "~/models/types/creature-skill";
import { useCreatureTreasureOptions } from "~/models/types/creature-treasure";
import { useCreatureTypeOptions } from "~/models/types/creature-type";
import { useDamageTypeOptions } from "~/models/types/damage-type";
import { useLanguageScopeOptions } from "~/models/types/language-scope";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createDistanceInputField,
  createEquipmentBundleField,
  createInputField,
  createMultipleSelectEnumField,
  createMultipleSelectIdsField,
  createNumberInputField,
  createResourceSearchField,
  createSelectEnumField,
  createSelectField,
  createTextareaField,
} from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create Creature Editor
//------------------------------------------------------------------------------

export type CreatureEditorProps = {
  campaignId: string;
  resource: Creature;
};

export function createCreatureEditor(form: Form<CreatureFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //------------------------------------------------------------------------------
  // Abilities
  //------------------------------------------------------------------------------

  const AbilityChaField = createNumberInputField({
    i18nContext: { label: { en: "Charisma", it: "Carisma" } },
    useField: form.createUseField("ability_cha"),
  });

  const AbilityConField = createNumberInputField({
    i18nContext: { label: { en: "Constitution", it: "Costituzione" } },
    useField: form.createUseField("ability_con"),
  });

  const AbilityDexField = createNumberInputField({
    i18nContext: { label: { en: "Dexterity", it: "Destrezza" } },
    useField: form.createUseField("ability_dex"),
  });

  const AbilityIntField = createNumberInputField({
    i18nContext: { label: { en: "Intelligence", it: "Intelligenza" } },
    useField: form.createUseField("ability_int"),
  });

  const AbilityStrField = createNumberInputField({
    i18nContext: { label: { en: "Strength", it: "Forza" } },
    useField: form.createUseField("ability_str"),
  });

  const AbilityWisField = createNumberInputField({
    i18nContext: { label: { en: "Wisdom", it: "Saggezza" } },
    useField: form.createUseField("ability_wis"),
  });

  //----------------------------------------------------------------------------
  // AC
  //----------------------------------------------------------------------------

  const ACField = createNumberInputField({
    i18nContext: { label: { en: "Armor Class", it: "Classe Armatura" } },
    useField: form.createUseField("ac"),
  });

  //----------------------------------------------------------------------------
  // Alignment
  //----------------------------------------------------------------------------

  const AlignmentField = createSelectEnumField({
    i18nContext: { label: { en: "Alignment", it: "Allineamento" } },
    useField: form.createUseField("alignment"),
    useOptions: useCreatureAlignmentOptions,
  });

  //----------------------------------------------------------------------------
  // Conditions
  //----------------------------------------------------------------------------

  const ConditionImmunitiesField = createMultipleSelectEnumField({
    i18nContext: {
      label: {
        en: "Condition Immunities",
        it: "Immunità alle Condizioni",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("condition_immunities"),
    useOptions: useCreatureConditionOptions,
  });

  const ConditionResistancesField = createMultipleSelectEnumField({
    i18nContext: {
      label: {
        en: "Condition Resistances",
        it: "Resistenze alle Condizioni",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("condition_resistances"),
    useOptions: useCreatureConditionOptions,
  });

  const ConditionVulnerabilitiesField = createMultipleSelectEnumField({
    i18nContext: {
      label: {
        en: "Condition Vulnerabilities",
        it: "Vulnerabilità alle Condizioni",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("condition_vulnerabilities"),
    useOptions: useCreatureConditionOptions,
  });

  //----------------------------------------------------------------------------
  // CR
  //----------------------------------------------------------------------------

  const CRField = createSelectField({
    i18nContext: { label: { en: "Challenge Rating", it: "Grado Sfida" } },
    inputProps: {
      parse: parseCreatureChallengeRating,
      stringify: stringifyCreatureChallengeRating,
    },
    useField: form.createUseField("cr"),
    useOptions: useCreatureChallengeRatingOptions,
  });

  //----------------------------------------------------------------------------
  // Damages
  //----------------------------------------------------------------------------

  const DamageImmunitiesField = createMultipleSelectEnumField({
    i18nContext: {
      label: {
        en: "Damage Immunities",
        it: "Immunità ai Danni",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("damage_immunities"),
    useOptions: useDamageTypeOptions,
  });

  const DamageResistancesField = createMultipleSelectEnumField({
    i18nContext: {
      label: {
        en: "Damage Resistances",
        it: "Resistenze ai Danni",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("damage_resistances"),
    useOptions: useDamageTypeOptions,
  });

  const DamageVulnerabilitiesField = createMultipleSelectEnumField({
    i18nContext: {
      label: {
        en: "Damage Vulnerabilities",
        it: "Vulnerabilità ai Danni",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("damage_vulnerabilities"),
    useOptions: useDamageTypeOptions,
  });

  //----------------------------------------------------------------------------
  // Gear
  //----------------------------------------------------------------------------

  const GearField = createEquipmentBundleField({
    i18nContext: { label: { en: "Gear", it: "Attrezzatura" } },
    useField: form.createUseField("gear"),
  });

  //----------------------------------------------------------------------------
  // Habitat
  //----------------------------------------------------------------------------

  const HabitatsField = createMultipleSelectEnumField({
    i18nContext: {
      label: { en: "Habitat", it: "Habitat" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    useField: form.createUseField("habitats"),
    useOptions: useCreatureHabitatOptions,
  });

  const PlaneIdsField = createMultipleSelectIdsField({
    i18nContext: {
      label: { en: "Planes", it: "Piani" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    useField: form.createUseField("plane_ids"),
    useOptions: planeStore.useResourceOptions,
  });

  //----------------------------------------------------------------------------
  // HP
  //----------------------------------------------------------------------------

  const HPField = createNumberInputField({
    i18nContext: { label: { en: "Hit Points", it: "Punti Ferita" } },
    useField: form.createUseField("hp"),
  });

  const HPFormulaField = createInputField({
    i18nContext: {
      label: { en: "HP Formula", it: "Formula PF" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    useField: form.createUseField("hp_formula"),
  });

  //----------------------------------------------------------------------------
  // Initiative
  //----------------------------------------------------------------------------

  const InitiativeField = createNumberInputField({
    i18nContext: { label: { en: "Initiative", it: "Iniziativa" } },
    useField: form.createUseField("initiative"),
  });

  //----------------------------------------------------------------------------
  // Language
  //----------------------------------------------------------------------------

  const useLanguageScopeField = form.createUseField("language_scope");

  const LanguageScopeField = createSelectEnumField({
    i18nContext: { label: { en: "Languages", it: "Lingue" } },
    useField: useLanguageScopeField,
    useOptions: useLanguageScopeOptions,
  });

  const LanguageIdsField = createResourceSearchField({
    i18nContext: {
      label: { en: "these...", it: "queste..." },
      placeholder: { en: "None", it: "Nessuna" },
    },
    useField: form.createUseField("language_ids"),
    useOptions: languageStore.useResourceOptions,
  });

  const LanguageAdditionalCountField = createNumberInputField({
    i18nContext: { label: { en: "plus...", it: "più..." } },
    inputProps: { min: 0 },
    useField: form.createUseField("language_additional_count"),
  });

  const TelepathyRangeField = createDistanceInputField({
    i18nContext: { label: { en: "Telepathy", it: "Telepatia" } },
    inputProps: { min: 0 },
    useField: form.createUseField("telepathy_range"),
  });

  //----------------------------------------------------------------------------
  // Passive Perception
  //----------------------------------------------------------------------------

  const PassivePerceptionField = createNumberInputField({
    i18nContext: {
      label: { en: "Passive Perception", it: "Percezione Passiva" },
    },
    inputProps: { min: 0 },
    useField: form.createUseField("passive_perception"),
  });

  //----------------------------------------------------------------------------
  // Proficiencies
  //----------------------------------------------------------------------------

  const AbilityProficienciesField = createMultipleSelectEnumField({
    i18nContext: {
      label: {
        en: "Saving Throws Proficiencies",
        it: "Competenze Tiri Salvezza",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("ability_proficiencies"),
    useOptions: useCreatureAbilityOptions,
  });

  const SkillProficienciesField = createMultipleSelectEnumField({
    i18nContext: {
      label: { en: "Skill Proficiencies", it: "Competenze nelle Abilità" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    useField: form.createUseField("skill_proficiencies"),
    useOptions: useCreatureSkillOptions,
  });

  const SkillExpertiseField = createMultipleSelectEnumField({
    i18nContext: {
      label: { en: "Skill Expertise", it: "Maestrie nelle Abilità" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    useField: form.createUseField("skill_expertise"),
    useOptions: useCreatureSkillOptions,
  });

  //----------------------------------------------------------------------------
  // Senses
  //----------------------------------------------------------------------------

  const BlindsightField = createDistanceInputField({
    i18nContext: { label: { en: "Blindsight", it: "Vista Cieca" } },
    inputProps: { min: 0 },
    useField: form.createUseField("blindsight"),
  });

  const DarkvisionField = createDistanceInputField({
    i18nContext: { label: { en: "Darkvision", it: "Scurovisione" } },
    inputProps: { min: 0 },
    useField: form.createUseField("darkvision"),
  });

  const TremorsenseField = createDistanceInputField({
    i18nContext: { label: { en: "Tremorsense", it: "Percezione Tellurica" } },
    inputProps: { min: 0 },
    useField: form.createUseField("tremorsense"),
  });

  const TruesightField = createDistanceInputField({
    i18nContext: { label: { en: "Truesight", it: "Vista Pura" } },
    inputProps: { min: 0 },
    useField: form.createUseField("truesight"),
  });

  //----------------------------------------------------------------------------
  // Size
  //----------------------------------------------------------------------------

  const SizeField = createSelectEnumField({
    i18nContext: { label: { en: "Size", it: "Taglia" } },
    useField: form.createUseField("size"),
    useOptions: useCreatureSizeOptions,
  });

  //----------------------------------------------------------------------------
  // Speed
  //----------------------------------------------------------------------------

  const SpeedBurrowField = createDistanceInputField({
    i18nContext: { label: { en: "Burrow", it: "Scavo" } },
    inputProps: { min: 0 },
    useField: form.createUseField("speed_burrow"),
  });

  const SpeedClimbField = createDistanceInputField({
    i18nContext: { label: { en: "Climb", it: "Scalare" } },
    inputProps: { min: 0 },
    useField: form.createUseField("speed_climb"),
  });

  const SpeedFlyField = createDistanceInputField({
    i18nContext: { label: { en: "Fly", it: "Volare" } },
    inputProps: { min: 0 },
    useField: form.createUseField("speed_fly"),
  });

  const SpeedSwimField = createDistanceInputField({
    i18nContext: { label: { en: "Swim", it: "Nuotare" } },
    inputProps: { min: 0 },
    useField: form.createUseField("speed_swim"),
  });

  const SpeedWalkField = createDistanceInputField({
    i18nContext: { label: { en: "Speed", it: "Velocità" } },
    inputProps: { min: 0 },
    useField: form.createUseField("speed_walk"),
  });

  //----------------------------------------------------------------------------
  // Tag Ids
  //----------------------------------------------------------------------------

  const TagIdsField = createResourceSearchField({
    i18nContext: {
      label: { en: "Groups", it: "Group" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    useField: form.createUseField("tag_ids"),
    useOptions: creatureTagStore.useResourceOptions,
  });

  //----------------------------------------------------------------------------
  // Text
  //----------------------------------------------------------------------------

  const ActionsField = createTextareaField({
    i18nContext: {
      label: { en: "Actions", it: "Azioni" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    inputProps: { rows: 5 },
    translatable: true,
    useField: form.createUseField("actions"),
  });

  const BonusActionsField = createTextareaField({
    i18nContext: {
      label: { en: "Bonus Actions", it: "Azioni Bonus" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    inputProps: { rows: 5 },
    translatable: true,
    useField: form.createUseField("bonus_actions"),
  });

  const LegendaryActionsField = createTextareaField({
    i18nContext: {
      label: { en: "Legendary Actions", it: "Azioni Leggendarie" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    inputProps: { rows: 5 },
    translatable: true,
    useField: form.createUseField("legendary_actions"),
  });

  const ReactionsField = createTextareaField({
    i18nContext: {
      label: { en: "Reactions", it: "Reazioni" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    inputProps: { rows: 5 },
    translatable: true,
    useField: form.createUseField("reactions"),
  });

  const TraitsField = createTextareaField({
    i18nContext: {
      label: { en: "Traits", it: "Tratti" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    inputProps: { rows: 5 },
    translatable: true,
    useField: form.createUseField("traits"),
  });

  //----------------------------------------------------------------------------
  // Treasures
  //----------------------------------------------------------------------------

  const TreasuresField = createMultipleSelectEnumField({
    i18nContext: {
      label: { en: "Treasures", it: "Tesori" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    useField: form.createUseField("treasures"),
    useOptions: useCreatureTreasureOptions,
  });

  //------------------------------------------------------------------------------
  // Type
  //------------------------------------------------------------------------------

  const TypeField = createSelectEnumField({
    i18nContext: { label: { en: "Type", it: "Tipo" } },
    useField: form.createUseField("type"),
    useOptions: useCreatureTypeOptions,
  });

  //----------------------------------------------------------------------------
  // Creature Editor
  //----------------------------------------------------------------------------

  return function CreatureEditor({
    campaignId,
    resource,
  }: CreatureEditorProps) {
    const [lang] = useI18nLang();
    const { value: languageScope } = useLanguageScopeField(
      resource.language_scope,
    );

    return (
      <ResourceEditor resource={resource}>
        {/* Type and Basic Stats */}
        <HStack align="flex-start" gap={4} w="full">
          <TypeField defaultValue={resource.type} />
          <SizeField defaultValue={resource.size} />
          <AlignmentField defaultValue={resource.alignment} />
        </HStack>

        {/* Tags */}
        <TagIdsField campaignId={campaignId} defaultValue={resource.tag_ids} />

        {/* Treasures & Habitat */}
        <HStack align="flex-start" gap={4} w="full">
          <TreasuresField defaultValue={resource.treasures} />
          <HabitatsField defaultValue={resource.habitats} />
          <PlaneIdsField
            campaignId={campaignId}
            defaultValue={resource.plane_ids}
          />
        </HStack>

        {/* AC and HP */}
        <HStack align="flex-start" gap={4} w="full">
          <ACField defaultValue={resource.ac} />
          <HPField defaultValue={resource.hp} />
          <HPFormulaField defaultValue={resource.hp_formula} />
        </HStack>

        {/* CR, Initiative, and Speed */}
        <HStack align="flex-start" gap={4} w="full">
          <CRField defaultValue={resource.cr} />
          <InitiativeField defaultValue={resource.initiative} />
          <SpeedWalkField defaultValue={resource.speed_walk ?? 0} />
        </HStack>

        {/* Speed */}
        <HStack align="flex-start" gap={4} w="full">
          <SpeedFlyField defaultValue={resource.speed_fly ?? 0} />
          <SpeedSwimField defaultValue={resource.speed_swim ?? 0} />
          <SpeedClimbField defaultValue={resource.speed_climb ?? 0} />
          <SpeedBurrowField defaultValue={resource.speed_burrow ?? 0} />
        </HStack>

        {/* Ability Scores */}
        <HStack align="flex-start" gap={4} w="full">
          <AbilityStrField defaultValue={resource.ability_str} />
          <AbilityDexField defaultValue={resource.ability_dex} />
          <AbilityConField defaultValue={resource.ability_con} />
          <AbilityIntField defaultValue={resource.ability_int} />
          <AbilityWisField defaultValue={resource.ability_wis} />
          <AbilityChaField defaultValue={resource.ability_cha} />
        </HStack>

        {/* Proficiencies */}
        <HStack align="flex-start" gap={4} w="full">
          <AbilityProficienciesField
            defaultValue={resource.ability_proficiencies}
          />
          <SkillProficienciesField
            defaultValue={resource.skill_proficiencies}
          />
          <SkillExpertiseField defaultValue={resource.skill_expertise} />
        </HStack>

        {/* Damage Interactions */}
        <HStack align="flex-start" gap={4} w="full">
          <DamageImmunitiesField defaultValue={resource.damage_immunities} />
          <DamageResistancesField defaultValue={resource.damage_resistances} />
          <DamageVulnerabilitiesField
            defaultValue={resource.damage_vulnerabilities}
          />
        </HStack>

        {/* Condition Interactions */}
        <HStack align="flex-start" gap={4} w="full">
          <ConditionImmunitiesField
            defaultValue={resource.condition_immunities}
          />
          <ConditionResistancesField
            defaultValue={resource.condition_resistances}
          />
          <ConditionVulnerabilitiesField
            defaultValue={resource.condition_vulnerabilities}
          />
        </HStack>

        {/* Senses */}
        <HStack align="flex-start" gap={4} w="full">
          <BlindsightField defaultValue={resource.blindsight} />
          <DarkvisionField defaultValue={resource.darkvision} />
          <TremorsenseField defaultValue={resource.tremorsense} />
          <TruesightField defaultValue={resource.truesight} />
        </HStack>

        {/* Perception and Language */}
        <HStack w="full">
          <PassivePerceptionField defaultValue={resource.passive_perception} />
          <TelepathyRangeField defaultValue={resource.telepathy_range} />
          <LanguageScopeField defaultValue={resource.language_scope} />
        </HStack>

        {/* Language */}
        {languageScope === "specific" && (
          <HStack align="flex-start" gap={2} w="full">
            <LanguageIdsField
              campaignId={campaignId}
              defaultValue={resource.language_ids}
            />
            <LanguageAdditionalCountField
              defaultValue={resource.language_additional_count}
              w="5em"
            />
          </HStack>
        )}

        {/* Gear */}
        <GearField campaignId={campaignId} defaultValue={resource.gear} />

        {/* Actions and Traits */}
        <TraitsField defaultValue={resource.traits[lang] ?? ""} />
        <ActionsField defaultValue={resource.actions[lang] ?? ""} />
        <BonusActionsField defaultValue={resource.bonus_actions[lang] ?? ""} />
        <ReactionsField defaultValue={resource.reactions[lang] ?? ""} />
        <LegendaryActionsField
          defaultValue={resource.legendary_actions[lang] ?? ""}
        />
      </ResourceEditor>
    );
  };
}
