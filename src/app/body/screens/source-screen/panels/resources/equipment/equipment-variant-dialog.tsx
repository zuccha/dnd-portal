import {
  Badge,
  CloseButton,
  Dialog,
  HStack,
  Portal,
  Span,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { useFormatGrams } from "~/measures/weight";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { Equipment } from "~/models/resources/equipment/equipment";
import {
  addEquipmentVariant,
  createEquipmentVariant,
} from "~/models/resources/equipment/equipment-variant";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type {
  DBEquipmentModifier,
  DBEquipmentModifierTranslation,
} from "~/models/resources/modifiers/equipment/db-equipment-modifier";
import type { EquipmentModifier } from "~/models/resources/modifiers/equipment/equipment-modifier";
import type { EquipmentModifierFilters } from "~/models/resources/modifiers/equipment/equipment-modifier-filters";
import type { LocalizedEquipmentModifier } from "~/models/resources/modifiers/equipment/localized-equipment-modifier";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { createMemoryStore } from "~/store/memory-store";
import Button from "~/ui/button";
import Checkbox from "~/ui/checkbox";
import IconButton from "~/ui/icon-button";
import { toaster } from "~/ui/toaster";

//------------------------------------------------------------------------------
// Equipment Variant Request
//------------------------------------------------------------------------------

type EquipmentVariantRequest<E extends Equipment> = {
  base: E;
  selected_modifier_ids: string[];
};

//------------------------------------------------------------------------------
// Create Equipment Variant Dialog
//------------------------------------------------------------------------------

export function createEquipmentVariantDialog<
  E extends Equipment,
  L extends LocalizedResource<E>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
  EM extends EquipmentModifier,
  EML extends LocalizedEquipmentModifier<EM>,
  EMF extends EquipmentModifierFilters,
  DBEM extends DBEquipmentModifier,
  DBTM extends DBEquipmentModifierTranslation,
>(
  store: ResourceStore<E, L, F, DBR, DBT>,
  modifierStore: ResourceStore<EM, EML, EMF, DBEM, DBTM>,
) {
  const pendingEquipmentVariantStore =
    createMemoryStore<EquipmentVariantRequest<E> | null>(
      `equipment_variant_dialog[${store.name.p}].pending`,
      null,
    );

  const close = () => pendingEquipmentVariantStore.set(null);

  //----------------------------------------------------------------------------
  // Open
  //----------------------------------------------------------------------------

  const open = (equipment: E): void => {
    const baseId = equipment.variant_base_id ?? equipment.id;
    const base = store.getResource(baseId) ?? equipment;

    pendingEquipmentVariantStore.set({
      base,
      selected_modifier_ids: equipment.variant_modifier_ids ?? [],
    });
  };

  //----------------------------------------------------------------------------
  // Equipment Variant Dialog
  //----------------------------------------------------------------------------

  function EquipmentVariantDialog({ sourceId }: { sourceId: string }) {
    const request = pendingEquipmentVariantStore.useValue();
    const { t } = useI18nLangContext(i18nContext);

    return (
      <Dialog.Root
        closeOnEscape
        closeOnInteractOutside
        lazyMount
        onOpenChange={(e) => {
          if (!e.open) close();
        }}
        open={!!request}
        size="lg"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{t("title")}</Dialog.Title>
              </Dialog.Header>

              {request && (
                <EquipmentVariantDialogContent
                  request={request}
                  sourceId={sourceId}
                />
              )}

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    );
  }

  //----------------------------------------------------------------------------
  // Equipment Variant Content
  //----------------------------------------------------------------------------

  function EquipmentVariantDialogContent({
    request,
    sourceId,
  }: {
    request: EquipmentVariantRequest<E>;
    sourceId: string;
  }) {
    const { lang } = useI18nLangContext(i18nContext);

    const modifierIds = request.base.modifier_ids;
    const allModifierIds = modifierStore.useAllResourceIds(sourceId);
    const allModifiers = modifierStore.useResources(allModifierIds);
    const allModifiersById = useMemo(
      () => new Map(allModifiers.map((modifier) => [modifier.id, modifier])),
      [allModifiers],
    );
    const modifiers = modifierIds
      .map((id) => allModifiersById.get(id))
      .filter((modifier): modifier is EM => !!modifier);

    if (modifiers.length !== modifierIds.length)
      return <EquipmentVariantDialogLoading modifierIds={modifierIds} />;

    const orderedModifierIds = modifiers
      .sort((a, b) =>
        translate(a.name, lang).localeCompare(translate(b.name, lang), lang),
      )
      .map(({ id }) => id);

    return (
      <EquipmentVariantDialogLoaded
        key={orderedModifierIds.join("|")}
        modifiersById={allModifiersById}
        orderedModifierIds={orderedModifierIds}
        request={request}
      />
    );
  }

  //----------------------------------------------------------------------------
  // Equipment Variant Dialog Loading
  //----------------------------------------------------------------------------

  function EquipmentVariantDialogLoading({
    modifierIds,
  }: {
    modifierIds: string[];
  }) {
    const { t } = useI18nLangContext(i18nContext);

    return (
      <>
        <Dialog.Body>
          <VStack align="stretch" gap={2}>
            <Text color="fg.muted" fontSize="sm">
              {t("modifiers")}
            </Text>
            {modifierIds.map((modifierId) => (
              <Text color="fg.muted" fontSize="sm" key={modifierId}>
                {t("loading")}
              </Text>
            ))}
          </VStack>
        </Dialog.Body>

        <Dialog.Footer>
          <Dialog.ActionTrigger asChild>
            <Button variant="outline">{t("cancel")}</Button>
          </Dialog.ActionTrigger>

          <Button disabled>{t("create")}</Button>
        </Dialog.Footer>
      </>
    );
  }

  //----------------------------------------------------------------------------
  // Equipment Variant Dialog Loaded
  //----------------------------------------------------------------------------

  function EquipmentVariantDialogLoaded({
    modifiersById,
    orderedModifierIds,
    request,
  }: {
    modifiersById: Map<string, EquipmentModifier>;
    orderedModifierIds: string[];
    request: EquipmentVariantRequest<E>;
  }) {
    const { lang, t } = useI18nLangContext(i18nContext);
    const formatCost = useFormatCp();
    const formatWeight = useFormatGrams();
    const [orderedIds, setOrderedIds] = useState(orderedModifierIds);
    const [selectedModifierIds, setSelectedModifierIds] = useState<string[]>(
      request.selected_modifier_ids,
    );
    const [saving, setSaving] = useState(false);

    const selectedModifiers = orderedIds
      .filter((id) => selectedModifierIds.includes(id))
      .map((id) => modifiersById.get(id))
      .filter((modifier): modifier is EquipmentModifier => !!modifier);

    const preview =
      selectedModifiers.length === selectedModifierIds.length ?
        createEquipmentVariant(request.base, selectedModifiers, "preview")
      : undefined;

    const confirm = async () => {
      if (
        selectedModifierIds.length === 0 ||
        selectedModifiers.length !== selectedModifierIds.length
      )
        return;

      setSaving(true);
      const added = addEquipmentVariant(
        store.addVirtualResourceRecipe,
        request.base,
        selectedModifiers,
      );
      setSaving(false);

      if (!added) {
        toaster.warning({
          description: t("duplicate_variant_description"),
          title: t("duplicate_variant_title"),
        });
        return;
      }

      close();
    };

    return (
      <>
        <Dialog.Body>
          <VStack align="stretch" gap={4}>
            <VStack align="stretch" gap={2}>
              <Text color="fg.muted" fontSize="sm">
                {t("modifiers")}
              </Text>
              {orderedIds.map((modifierId) => {
                const modifier = modifiersById.get(modifierId)!;
                const checked = selectedModifierIds.includes(modifier.id);
                const index = orderedIds.indexOf(modifier.id);

                return (
                  <HStack key={modifier.id} minH={8}>
                    <Checkbox
                      flex={1}
                      label={translate(modifier.name, lang)}
                      onValueChange={(value) =>
                        setSelectedModifierIds((prev) =>
                          value ?
                            [...prev, modifier.id]
                          : prev.filter((id) => id !== modifier.id),
                        )
                      }
                      value={checked}
                    />

                    <IconButton
                      Icon={ArrowUpIcon}
                      aria-label={t("move_up")}
                      disabled={index <= 0}
                      onClick={() =>
                        setOrderedIds((prev) =>
                          moveModifier(prev, modifier.id, -1),
                        )
                      }
                      size="xs"
                      variant="ghost"
                    />

                    <IconButton
                      Icon={ArrowDownIcon}
                      aria-label={t("move_down")}
                      disabled={index < 0 || index >= orderedIds.length - 1}
                      onClick={() =>
                        setOrderedIds((prev) =>
                          moveModifier(prev, modifier.id, 1),
                        )
                      }
                      size="xs"
                      variant="ghost"
                    />
                  </HStack>
                );
              })}
            </VStack>

            {preview && (
              <VStack
                align="stretch"
                borderColor="border"
                borderWidth={1}
                gap={3}
                p={3}
                rounded="md"
              >
                <HStack justify="space-between">
                  <Text fontWeight="medium">
                    {translate(preview.name, lang)}
                  </Text>
                  {preview.virtual && (
                    <Badge colorPalette="gray">{t("variant")}</Badge>
                  )}
                </HStack>

                <HStack color="fg.muted" fontSize="sm" gap={4}>
                  <Span>
                    {preview.cost === null ?
                      t("unspecified")
                    : formatCost(preview.cost)}
                  </Span>
                  <Span>
                    {preview.weight === null ?
                      t("unspecified")
                    : formatWeight(preview.weight)}
                  </Span>
                  <Span>{preview.magic ? t("magic") : t("non_magic")}</Span>
                  <Span>{preview.rarity}</Span>
                </HStack>

                {preview.required_attunement_slots > 0 && (
                  <Text color="fg.muted" fontSize="sm">
                    {t("attunement")}: {preview.required_attunement_slots}
                  </Text>
                )}

                {translate(preview.notes, lang) && (
                  <Text fontSize="sm" whiteSpace="pre-wrap">
                    {translate(preview.notes, lang)}
                  </Text>
                )}
              </VStack>
            )}
          </VStack>
        </Dialog.Body>

        <Dialog.Footer>
          <Dialog.ActionTrigger asChild>
            <Button variant="outline">{t("cancel")}</Button>
          </Dialog.ActionTrigger>

          <Button
            disabled={
              selectedModifierIds.length === 0 ||
              selectedModifiers.length !== selectedModifierIds.length
            }
            loading={saving}
            onClick={confirm}
          >
            {t("create")}
          </Button>
        </Dialog.Footer>
      </>
    );
  }

  return { Dialog: EquipmentVariantDialog, open };
}

//------------------------------------------------------------------------------
// Move Modifier
//------------------------------------------------------------------------------

function moveModifier(
  modifierIds: string[],
  modifierId: string,
  delta: -1 | 1,
): string[] {
  const index = modifierIds.indexOf(modifierId);
  const nextIndex = index + delta;
  if (index < 0 || nextIndex < 0 || nextIndex >= modifierIds.length)
    return modifierIds;

  const result = [...modifierIds];
  [result[index], result[nextIndex]] = [result[nextIndex]!, result[index]!];
  return result;
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  attunement: {
    en: "Attunement slots",
    it: "Slot sintonia",
  },
  base: {
    en: "Base equipment",
    it: "Equipaggiamento base",
  },
  cancel: {
    en: "Cancel",
    it: "Cancella",
  },
  create: {
    en: "Add variant",
    it: "Aggiungi variante",
  },
  duplicate_variant_description: {
    en: "The selected modifier composition has already been added.",
    it: "La composizione di modificatori selezionata e già stata aggiunta.",
  },
  duplicate_variant_title: {
    en: "Variant already exists",
    it: "La variante esiste già",
  },
  loading: {
    en: "Loading...",
    it: "Caricamento...",
  },
  magic: {
    en: "Magic",
    it: "Magico",
  },
  modifiers: {
    en: "Modifiers",
    it: "Modificatori",
  },
  move_down: {
    en: "Move down",
    it: "Sposta giu",
  },
  move_up: {
    en: "Move up",
    it: "Sposta su",
  },
  non_magic: {
    en: "Nonmagic",
    it: "Non magico",
  },
  title: {
    en: "Add equipment variant",
    it: "Aggiungi variante equipaggiamento",
  },
  unspecified: {
    en: "Unspecified",
    it: "Non specificato",
  },
  variant: {
    en: "Variant",
    it: "Variante",
  },
};
