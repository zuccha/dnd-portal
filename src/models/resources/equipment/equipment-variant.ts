import type { I18nString } from "~/i18n/i18n-string";
import type { Equipment } from "./equipment";

//------------------------------------------------------------------------------
// Clone Equipment Variant
//------------------------------------------------------------------------------

export function cloneEquipmentVariant<E extends Equipment>(base: E): E {
  return {
    ...base,
    id: crypto.randomUUID(),
    name: appendVariantLabel(base.name),
    name_short: appendVariantLabel(
      Object.keys(base.name_short).length ? base.name_short : base.name,
    ),
    variant_base_id: base.variant_base_id ?? base.id,
    variant_modifier_ids: [...(base.variant_modifier_ids ?? [])],
    virtual: true,
  };
}

//------------------------------------------------------------------------------
// Utils
//------------------------------------------------------------------------------

function appendVariantLabel(name: I18nString): I18nString {
  const result: I18nString = {};
  const entries = Object.entries(name);

  for (const [lang, value] of entries) {
    if (!value) continue;
    result[lang] = `${value} ${variantLabels[lang] ?? variantLabels["en"]}`;
  }

  return result;
}

const variantLabels: Record<string, string> = {
  en: "Variant",
  it: "Variante",
};
