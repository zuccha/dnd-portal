import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { I18nString } from "~/i18n/i18n-string";
import type { ResourceOption } from "~/models/resources/resource";
import Field, { type FieldProps } from "~/ui/field";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import Select, { type SelectOption } from "~/ui/select";
import type { FieldBag } from "~/utils/form";
import ResourceSearch from "./resource-search";

//------------------------------------------------------------------------------
// I18n Field Context
//------------------------------------------------------------------------------

type I18nFieldContext<T extends string> = Record<T, I18nString>;

//------------------------------------------------------------------------------
// Create Input Field
//------------------------------------------------------------------------------

export type InputFieldProps = FieldProps & {
  defaultValue: string;
};

export function createInputField({
  i18nContext,
  i18nContextExtra,
  translatable,
  useField,
}: {
  i18nContext: I18nFieldContext<"label" | "placeholder">;
  i18nContextExtra?: Record<string, I18nString>;
  translatable?: boolean;
  useField: (defaultValue: string) => FieldBag<string, string>;
}) {
  const context = { ...i18nContext, ...i18nContextExtra };

  function InputField({ defaultValue, ...rest }: InputFieldProps) {
    const { error, ...field } = useField(defaultValue);
    const { t } = useI18nLangContext(context);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <Input
          bgColor={translatable ? "bg.info" : undefined}
          placeholder={t("placeholder")}
          {...field}
        />
      </Field>
    );
  }

  return InputField;
}

//------------------------------------------------------------------------------
// Create Multiple Select Field
//------------------------------------------------------------------------------

export type MultipleSelectFieldProps<T extends string> = FieldProps & {
  defaultValue: T[];
};

export function createMultipleSelectField<T extends string>({
  i18nContext,
  i18nContextExtra,
  translatable,
  useOptions,
  useField,
}: {
  i18nContext: I18nFieldContext<"label" | "placeholder">;
  i18nContextExtra?: Record<string, I18nString>;
  translatable?: boolean;
  useOptions: () => SelectOption<T>[];
  useField: (defaultValue: T[]) => FieldBag<string, T[]>;
}) {
  const context = { ...i18nContext, ...i18nContextExtra };

  function MultipleSelectField({
    defaultValue,
    ...rest
  }: MultipleSelectFieldProps<T>) {
    const options = useOptions();
    const { error, ...field } = useField(defaultValue);
    const { t } = useI18nLangContext(context);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <Select
          bgColor={translatable ? "bg.info" : undefined}
          multiple
          options={options}
          placeholder={t("placeholder")}
          withinDialog
          {...field}
        />
      </Field>
    );
  }

  return MultipleSelectField;
}

//------------------------------------------------------------------------------
// Create Multiple Select Ids Field
//------------------------------------------------------------------------------

export type MultipleSelectIdsFieldProps<T extends string> = FieldProps & {
  campaignId: string;
  defaultValue: T[];
};

export function createMultipleSelectIdsField<T extends string>({
  i18nContext,
  i18nContextExtra,
  translatable,
  useOptions,
  useField,
}: {
  i18nContext: I18nFieldContext<"label" | "placeholder">;
  i18nContextExtra?: Record<string, I18nString>;
  translatable?: boolean;
  useOptions: (campaignId: string) => SelectOption<T>[];
  useField: (defaultValue: T[]) => FieldBag<string, T[]>;
}) {
  const context = { ...i18nContext, ...i18nContextExtra };

  function MultipleSelectIdsField({
    campaignId,
    defaultValue,
    ...rest
  }: MultipleSelectIdsFieldProps<T>) {
    const options = useOptions(campaignId);
    const { error, ...field } = useField(defaultValue);
    const { t } = useI18nLangContext(context);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <Select
          bgColor={translatable ? "bg.info" : undefined}
          multiple
          options={options}
          placeholder={t("placeholder")}
          withinDialog
          {...field}
        />
      </Field>
    );
  }

  return MultipleSelectIdsField;
}

//------------------------------------------------------------------------------
// Create Number Input Field
//------------------------------------------------------------------------------

export type NumberInputFieldProps = FieldProps & {
  defaultValue: number;
};

export function createNumberInputField({
  i18nContext,
  i18nContextExtra,
  translatable,
  useField,
}: {
  i18nContext: I18nFieldContext<"label">;
  i18nContextExtra?: Record<string, I18nString>;
  translatable?: boolean;
  useField: (defaultValue: number) => FieldBag<string, number>;
}) {
  const context = { ...i18nContext, ...i18nContextExtra };

  function NumberInputField({ defaultValue, ...rest }: NumberInputFieldProps) {
    const { error, ...field } = useField(defaultValue);
    const { t } = useI18nLangContext(context);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <NumberInput
          bgColor={translatable ? "bg.info" : undefined}
          {...field}
        />
      </Field>
    );
  }

  return NumberInputField;
}

//------------------------------------------------------------------------------
// Create Resource Search Field
//------------------------------------------------------------------------------

export type ResourceSearchFieldProps = FieldProps & {
  campaignId: string;
  defaultValue: string[];
};

export function createResourceSearchField({
  i18nContext,
  i18nContextExtra,
  translatable,
  useOptions,
  useField,
}: {
  i18nContext: I18nFieldContext<"label" | "placeholder">;
  i18nContextExtra?: Record<string, I18nString>;
  translatable?: boolean;
  useOptions: (campaignId: string) => ResourceOption[];
  useField: (defaultValue: string[]) => FieldBag<string, string[]>;
}) {
  const context = { ...i18nContext, ...i18nContextExtra };

  function ResourceSearchField({
    campaignId,
    defaultValue,
    ...rest
  }: ResourceSearchFieldProps) {
    const options = useOptions(campaignId);

    const { error, ...field } = useField(defaultValue);
    const { t } = useI18nLangContext(context);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <ResourceSearch
          bgColor={translatable ? "bg.info" : undefined}
          options={options}
          withinDialog
          {...field}
        />
      </Field>
    );
  }

  return ResourceSearchField;
}

//------------------------------------------------------------------------------
// Create Select Field
//------------------------------------------------------------------------------

export type SelectFieldProps<T extends string> = FieldProps & {
  defaultValue: T;
};

export function createSelectField<T extends string>({
  i18nContext,
  i18nContextExtra,
  translatable,
  useOptions,
  useField,
}: {
  i18nContext: I18nFieldContext<"label">;
  i18nContextExtra?: Record<string, I18nString>;
  translatable?: boolean;
  useOptions: () => SelectOption<T>[];
  useField: (defaultValue: T) => FieldBag<string, T>;
}) {
  const context = { ...i18nContext, ...i18nContextExtra };

  function SelectField({ defaultValue, ...rest }: SelectFieldProps<T>) {
    const options = useOptions();
    const { error, ...field } = useField(defaultValue);
    const { t } = useI18nLangContext(context);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <Select
          bgColor={translatable ? "bg.info" : undefined}
          options={options}
          withinDialog
          {...field}
        />
      </Field>
    );
  }

  return SelectField;
}
