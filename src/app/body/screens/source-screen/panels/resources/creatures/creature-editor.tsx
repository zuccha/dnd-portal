import { HStack, VStack } from "@chakra-ui/react";
import { PlusIcon } from "lucide-react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { creatureTagStore } from "~/models/resources/creature-tags/creature-tag-store";
import { type Creature } from "~/models/resources/creatures/creature";
import type { CreatureFormData } from "~/models/resources/creatures/creature-form";
import { languageStore } from "~/models/resources/languages/language-store";
import { planeStore } from "~/models/resources/planes/plane-store";
import { useCreatureAbilityOptions } from "~/models/types/creature-ability";
import { useCreatureAlignmentOptions } from "~/models/types/creature-alignment";
import {
  type CreatureChallengeRating,
  inferCreatureExp,
  inferCreatureLairExp,
  inferCreaturePb,
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
import Field from "~/ui/field";
import Icon from "~/ui/icon";
import Select from "~/ui/select";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createDistanceInputField,
  createEquipmentBundleField,
  createInputField,
  createLanguageEntriesField,
  createMultipleSelectEnumField,
  createMultipleSelectIdsField,
  createNumberInputField,
  createResourceSearchField,
  createSelectEnumField,
  createSwitchField,
  createTextareaField,
} from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create Creature Editor
//------------------------------------------------------------------------------

export type CreatureEditorProps = {
  resource: Creature;
  sourceId: string;
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

  const useCRField = form.createUseField("cr");
  const useExpField = form.createUseField("exp");
  const useLairExpField = form.createUseField("lair_exp");
  const usePBField = form.createUseField("pb");

  const crI18nContext = {
    label: { en: "Challenge Rating", it: "Grado Sfida" },
  };

  function CRField({
    defaultValue,
    resource,
  }: {
    defaultValue: CreatureChallengeRating;
    resource: Creature;
  }) {
    const options = useCreatureChallengeRatingOptions();
    const { error, onValueChange, ...field } = useCRField(defaultValue);
    const expField = useExpField(resource.exp);
    const lairExpField = useLairExpField(resource.lair_exp);
    const pbField = usePBField(resource.pb);
    const { t } = useI18nLangContext(crI18nContext);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")}>
        <Select
          options={options}
          parse={parseCreatureChallengeRating}
          stringify={stringifyCreatureChallengeRating}
          withinDialog
          {...field}
          onValueChange={(cr) => {
            onValueChange(cr);
            expField.onValueChange(inferCreatureExp(cr));
            lairExpField.onValueChange(inferCreatureLairExp(cr));
            pbField.onValueChange(inferCreaturePb(cr));
          }}
        />
      </Field>
    );
  }

  const PBField = createNumberInputField({
    i18nContext: { label: { en: "PB", it: "BC" } },
    inputProps: { min: 0 },
    useField: usePBField,
  });

  const ExpField = createNumberInputField({
    i18nContext: { label: { en: "XP", it: "PE" } },
    inputProps: { min: 0 },
    useField: useExpField,
  });

  const LairExpField = createNumberInputField({
    i18nContext: { label: { en: "Lair XP", it: "PE Tana" } },
    inputProps: { min: 0 },
    useField: useLairExpField,
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
  // Lair
  //----------------------------------------------------------------------------

  const useHasLairField = form.createUseField("has_lair");

  const HasLairField = createSwitchField({
    i18nContext: { label: { en: "Has Lair", it: "Ha una Tana" } },
    useField: useHasLairField,
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

  const LanguageEntriesField = createLanguageEntriesField({
    i18nContext: { label: { en: "", it: "" } },
    useField: form.createUseField("language_entries"),
    useOptions: languageStore.useResourceOptions,
  });

  const LanguageAdditionalCountField = createNumberInputField({
    i18nContext: { label: { en: "", it: "" } },
    inputProps: { min: 0 },
    useField: form.createUseField("language_additional_count"),
  });

  const TelepathyRangeField = createDistanceInputField({
    i18nContext: { label: { en: "Telepathy", it: "Telepatia" } },
    inputProps: { min: 0 },
    useField: form.createUseField("telepathy_range"),
  });

  //----------------------------------------------------------------------------
  // Legendary Actions Count
  //----------------------------------------------------------------------------

  const useLegendaryActionsCountField = form.createUseField(
    "legendary_actions_count",
  );

  const LegendaryActionsCountField = createNumberInputField({
    i18nContext: {
      label: { en: "Legendary Actions", it: "Azioni Leggendarie" },
    },
    inputProps: { min: 0 },
    useField: useLegendaryActionsCountField,
  });

  const useLairLegendaryActionsCountField = form.createUseField(
    "lair_legendary_actions_count",
  );

  const LairLegendaryActionsCountField = createNumberInputField({
    i18nContext: {
      label: { en: "...in Lair", it: "...nella Tana" },
    },
    inputProps: { min: 0 },
    useField: useLairLegendaryActionsCountField,
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

  const HoverField = createSwitchField({
    i18nContext: { label: { en: "Hover", it: "Fluttuare" } },
    useField: form.createUseField("hover"),
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
      label: { en: "", it: "" },
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

  const LairEffectsField = createTextareaField({
    i18nContext: {
      label: { en: "Lair Effects", it: "Effetti della Tana" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    inputProps: { rows: 5 },
    translatable: true,
    useField: form.createUseField("lair_effects"),
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

  return function CreatureEditor({ resource, sourceId }: CreatureEditorProps) {
    const [lang] = useI18nLang();
    const { value: hasLair } = useHasLairField(resource.has_lair);
    const { value: languageScope } = useLanguageScopeField(
      resource.language_scope,
    );
    const { value: legendaryActionsCount } = useLegendaryActionsCountField(
      resource.legendary_actions_count,
    );
    const { value: lairLegendaryActionsCount } =
      useLairLegendaryActionsCountField(resource.lair_legendary_actions_count);

    return (
      <ResourceEditor resource={resource}>
        {/* Type and Basic Stats */}
        <HStack align="flex-start" gap={4} w="full">
          <TypeField defaultValue={resource.type} />
          <SizeField defaultValue={resource.size} />
          <AlignmentField defaultValue={resource.alignment} />
        </HStack>

        {/* Tags */}
        <TagIdsField defaultValue={resource.tag_ids} sourceId={sourceId} />

        {/* Treasures & Habitat */}
        <HStack align="flex-start" gap={4} w="full">
          <HabitatsField defaultValue={resource.habitats} />
          <PlaneIdsField
            defaultValue={resource.plane_ids}
            sourceId={sourceId}
          />
          <TreasuresField defaultValue={resource.treasures} />
        </HStack>

        <HasLairField defaultValue={resource.has_lair} />

        {/* AC and HP */}
        <HStack align="flex-start" gap={4} w="full">
          <ACField defaultValue={resource.ac} />
          <HPField defaultValue={resource.hp} />
          <HPFormulaField defaultValue={resource.hp_formula} />
        </HStack>

        {/* CR, Initiative, and Speed */}
        <HStack align="flex-start" gap={4} w="full">
          <CRField defaultValue={resource.cr} resource={resource} />
          <PBField defaultValue={resource.pb} />
          <ExpField defaultValue={resource.exp} />
          {hasLair && <LairExpField defaultValue={resource.lair_exp} />}
        </HStack>

        <HStack align="flex-start" gap={4} w="full">
          <InitiativeField defaultValue={resource.initiative} />
          <SpeedWalkField defaultValue={resource.speed_walk ?? 0} />
        </HStack>

        {/* Speed */}
        <HStack align="flex-start" gap={4} w="full" wrap="wrap">
          <HStack flex={1}>
            <SpeedFlyField defaultValue={resource.speed_fly ?? 0} />
            <SpeedSwimField defaultValue={resource.speed_swim ?? 0} />
          </HStack>
          <HStack flex={1}>
            <SpeedClimbField defaultValue={resource.speed_climb ?? 0} />
            <SpeedBurrowField defaultValue={resource.speed_burrow ?? 0} />
          </HStack>
        </HStack>

        <HoverField defaultValue={resource.hover ?? false} />

        {/* Ability Scores */}
        <HStack align="flex-start" gap={4} w="full" wrap="wrap">
          <HStack flex={1}>
            <AbilityStrField defaultValue={resource.ability_str} />
            <AbilityDexField defaultValue={resource.ability_dex} />
            <AbilityConField defaultValue={resource.ability_con} />
          </HStack>
          <HStack flex={1}>
            <AbilityIntField defaultValue={resource.ability_int} />
            <AbilityWisField defaultValue={resource.ability_wis} />
            <AbilityChaField defaultValue={resource.ability_cha} />
          </HStack>
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
        <HStack align="flex-start" gap={4} w="full" wrap="wrap">
          <HStack flex={1}>
            <BlindsightField defaultValue={resource.blindsight} />
            <DarkvisionField defaultValue={resource.darkvision} />
          </HStack>
          <HStack flex={1}>
            <TremorsenseField defaultValue={resource.tremorsense} />
            <TruesightField defaultValue={resource.truesight} />
          </HStack>
        </HStack>

        {/* Perception and Language */}
        <HStack w="full">
          <PassivePerceptionField defaultValue={resource.passive_perception} />
          <TelepathyRangeField defaultValue={resource.telepathy_range} />
          <LanguageScopeField defaultValue={resource.language_scope} />
        </HStack>

        {/* Language */}
        {languageScope === "specific" && (
          <HStack align="flex-start" gap={2} mt={-1} w="full">
            <LanguageEntriesField
              defaultValue={resource.language_entries}
              sourceId={sourceId}
            />
            <HStack h={10}>
              <Icon Icon={PlusIcon} size="sm" />
            </HStack>
            <LanguageAdditionalCountField
              defaultValue={resource.language_additional_count}
              w="5em"
            />
          </HStack>
        )}

        {/* Gear */}
        <GearField defaultValue={resource.gear} sourceId={sourceId} w="full" />

        {/* Actions and Traits */}
        <TraitsField defaultValue={resource.traits[lang] ?? ""} />
        <ActionsField defaultValue={resource.actions[lang] ?? ""} />
        <BonusActionsField defaultValue={resource.bonus_actions[lang] ?? ""} />
        <ReactionsField defaultValue={resource.reactions[lang] ?? ""} />
        <VStack gap={2} w="full">
          <HStack align="flex-start" gap={4} w="full">
            <LegendaryActionsCountField
              defaultValue={resource.legendary_actions_count}
            />
            {hasLair && (
              <LairLegendaryActionsCountField
                defaultValue={resource.lair_legendary_actions_count}
              />
            )}
          </HStack>
          {(!!legendaryActionsCount ||
            (hasLair && !!lairLegendaryActionsCount)) && (
            <LegendaryActionsField
              defaultValue={resource.legendary_actions[lang] ?? ""}
            />
          )}
        </VStack>
        {hasLair && (
          <LairEffectsField defaultValue={resource.lair_effects[lang] ?? ""} />
        )}
      </ResourceEditor>
    );
  };
}
