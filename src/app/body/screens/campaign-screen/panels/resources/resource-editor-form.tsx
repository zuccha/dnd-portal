import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { I18nString } from "~/i18n/i18n-string";
import type { EquipmentBundle } from "~/models/other/equipment-bundle";
import type { ResourceOption } from "~/models/resources/resource";
import CostInput from "~/ui/cost-input";
import DistanceInput from "~/ui/distance-input";
import Field, { type FieldProps } from "~/ui/field";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import Select, { type SelectOption } from "~/ui/select";
import Switch from "~/ui/switch";
import Textarea from "~/ui/textarea";
import TimeInput from "~/ui/time-input";
import WeightInput from "~/ui/weight-input";
import type { FieldBag } from "~/utils/form";
import EquipmentBundleEditor from "./equipment-bundle-editor";
import ResourceSearch from "./resource-search";

//------------------------------------------------------------------------------
// Common Types
//------------------------------------------------------------------------------

type Props<T> = Omit<FieldProps, "defaultValue"> & { defaultValue: T };

type I18nFieldContext<T extends string> = Record<T, I18nString>;

//------------------------------------------------------------------------------
// Create Cost Input Field
//------------------------------------------------------------------------------

export type CostInputFieldProps = Props<number>;

export function createCostInputField({
  i18nContext,
  i18nContextExtra,
  inputProps,
  translatable,
  useField,
}: {
  i18nContext: I18nFieldContext<"label">;
  i18nContextExtra?: Record<string, I18nString>;
  inputProps?: { max?: number; min?: number };
  translatable?: boolean;
  useField: (defaultValue: number) => FieldBag<string, number>;
}) {
  const context = { ...i18nContext, ...i18nContextExtra };

  function CostInputField({ defaultValue, ...rest }: CostInputFieldProps) {
    const { error, ...field } = useField(defaultValue);
    const { t } = useI18nLangContext(context);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <CostInput
          bgColor={translatable ? "bg.info" : undefined}
          {...inputProps}
          {...field}
        />
      </Field>
    );
  }

  return CostInputField;
}

//------------------------------------------------------------------------------
// Create Distance Input Field
//------------------------------------------------------------------------------

export type DistanceInputFieldProps = Props<number>;

export function createDistanceInputField({
  i18nContext,
  i18nContextExtra,
  inputProps,
  translatable,
  useField,
}: {
  i18nContext: I18nFieldContext<"label">;
  i18nContextExtra?: Record<string, I18nString>;
  inputProps?: { max?: number; min?: number };
  translatable?: boolean;
  useField: (defaultValue: number) => FieldBag<string, number>;
}) {
  const context = { ...i18nContext, ...i18nContextExtra };

  function DistanceInputField({
    defaultValue,
    ...rest
  }: DistanceInputFieldProps) {
    const { error, ...field } = useField(defaultValue);
    const { t } = useI18nLangContext(context);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <DistanceInput
          bgColor={translatable ? "bg.info" : undefined}
          {...inputProps}
          {...field}
        />
      </Field>
    );
  }

  return DistanceInputField;
}

//------------------------------------------------------------------------------
// Create Equipment Bundle Field
//------------------------------------------------------------------------------

export type EquipmentBundleFieldProps = Props<EquipmentBundle> & {
  campaignId: string;
};

export function createEquipmentBundleField({
  i18nContext,
  i18nContextExtra,
  translatable,
  useField,
}: {
  i18nContext: I18nFieldContext<"label">;
  i18nContextExtra?: Record<string, I18nString>;
  translatable?: boolean;
  useField: (
    defaultValue: EquipmentBundle,
  ) => FieldBag<string, EquipmentBundle>;
}) {
  const context = { ...i18nContext, ...i18nContextExtra };

  function EquipmentBundleField({
    campaignId,
    defaultValue,
    ...rest
  }: EquipmentBundleFieldProps) {
    const { error, ...field } = useField(defaultValue);
    const { t } = useI18nLangContext(context);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <EquipmentBundleEditor
          bgColor={translatable ? "bg.info" : undefined}
          campaignId={campaignId}
          withinDialog
          {...field}
        />
      </Field>
    );
  }

  return EquipmentBundleField;
}

//------------------------------------------------------------------------------
// Create Input Field
//------------------------------------------------------------------------------

export type InputFieldProps = Props<string>;

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
// Create Multiple Select Enum Field
//------------------------------------------------------------------------------

export type MultipleSelectEnumFieldProps<T extends string> = Props<T[]>;

export function createMultipleSelectEnumField<T extends string>({
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

  function MultipleSelectEnumField({
    defaultValue,
    ...rest
  }: MultipleSelectEnumFieldProps<T>) {
    const options = useOptions();
    const { error, ...field } = useField(defaultValue);
    const { t } = useI18nLangContext(context);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <Select.Enum
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

  return MultipleSelectEnumField;
}

//------------------------------------------------------------------------------
// Create Multiple Select Ids Field
//------------------------------------------------------------------------------

export type MultipleSelectIdsFieldProps<T extends string> = Props<T[]> & {
  campaignId: string;
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
        <Select.Enum
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

export type NumberInputFieldProps = Props<number>;

export function createNumberInputField({
  i18nContext,
  i18nContextExtra,
  inputProps,
  translatable,
  useField,
}: {
  i18nContext: I18nFieldContext<"label">;
  i18nContextExtra?: Record<string, I18nString>;
  inputProps?: { max?: number; min?: number };
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
          {...inputProps}
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

export type ResourceSearchFieldProps = Props<string[]> & { campaignId: string };

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
// Create Select Enum Field
//------------------------------------------------------------------------------

export type SelectEnumFieldProps<T extends string> = Props<T>;

export function createSelectEnumField<T extends string>({
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

  function SelectEnumField({ defaultValue, ...rest }: SelectEnumFieldProps<T>) {
    const options = useOptions();
    const { error, ...field } = useField(defaultValue);
    const { t } = useI18nLangContext(context);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <Select.Enum
          bgColor={translatable ? "bg.info" : undefined}
          options={options}
          withinDialog
          {...field}
        />
      </Field>
    );
  }

  return SelectEnumField;
}

//------------------------------------------------------------------------------
// Create Select Field
//------------------------------------------------------------------------------

export type SelectFieldProps<T> = Props<T>;

export function createSelectField<T>({
  i18nContext,
  i18nContextExtra,
  inputProps,
  translatable,
  useOptions,
  useField,
}: {
  i18nContext: I18nFieldContext<"label">;
  i18nContextExtra?: Record<string, I18nString>;
  inputProps: { parse: (value: string) => T; stringify: (value: T) => string };
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
          {...inputProps}
          {...field}
        />
      </Field>
    );
  }

  return SelectField;
}

//------------------------------------------------------------------------------
// Create Switch Field
//------------------------------------------------------------------------------

export type SwitchFieldProps = Props<boolean>;

export function createSwitchField({
  i18nContext,
  i18nContextExtra,
  useField,
}: {
  i18nContext: I18nFieldContext<"label">;
  i18nContextExtra?: Record<string, I18nString>;
  useField: (defaultValue: boolean) => FieldBag<string, boolean>;
}) {
  const context = { ...i18nContext, ...i18nContextExtra };

  function SwitchField({ defaultValue }: SwitchFieldProps) {
    const field = useField(defaultValue);
    const { t } = useI18nLangContext(context);

    return <Switch label={t("label")} size="lg" {...field} />;
  }

  return SwitchField;
}

//------------------------------------------------------------------------------
// Create Textarea Field
//------------------------------------------------------------------------------

export type TextareaFieldProps = Props<string>;

export function createTextareaField({
  i18nContext,
  i18nContextExtra,
  inputProps,
  translatable,
  useField,
}: {
  i18nContext: I18nFieldContext<"label" | "placeholder">;
  i18nContextExtra?: Record<string, I18nString>;
  inputProps?: { rows?: number };
  translatable?: boolean;
  useField: (defaultValue: string) => FieldBag<string, string>;
}) {
  const context = { ...i18nContext, ...i18nContextExtra };

  function TextareaField({ defaultValue, ...rest }: TextareaFieldProps) {
    const { error, ...field } = useField(defaultValue);
    const { t } = useI18nLangContext(context);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <Textarea
          bgColor={translatable ? "bg.info" : undefined}
          placeholder={t("placeholder")}
          {...inputProps}
          {...field}
        />
      </Field>
    );
  }

  return TextareaField;
}

//------------------------------------------------------------------------------
// Create Time Input Field
//------------------------------------------------------------------------------

export type TimeInputFieldProps = Props<number>;

export function createTimeInputField({
  i18nContext,
  i18nContextExtra,
  inputProps,
  translatable,
  useField,
}: {
  i18nContext: I18nFieldContext<"label">;
  i18nContextExtra?: Record<string, I18nString>;
  inputProps?: { max?: number; min?: number };
  translatable?: boolean;
  useField: (defaultValue: number) => FieldBag<string, number>;
}) {
  const context = { ...i18nContext, ...i18nContextExtra };

  function TimeInputField({ defaultValue, ...rest }: TimeInputFieldProps) {
    const { error, ...field } = useField(defaultValue);
    const { t } = useI18nLangContext(context);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <TimeInput
          bgColor={translatable ? "bg.info" : undefined}
          {...inputProps}
          {...field}
        />
      </Field>
    );
  }

  return TimeInputField;
}

//------------------------------------------------------------------------------
// Create Weight Input Field
//------------------------------------------------------------------------------

export type WeightInputFieldProps = Props<number>;

export function createWeightInputField({
  i18nContext,
  i18nContextExtra,
  inputProps,
  translatable,
  useField,
}: {
  i18nContext: I18nFieldContext<"label">;
  i18nContextExtra?: Record<string, I18nString>;
  inputProps?: { max?: number; min?: number };
  translatable?: boolean;
  useField: (defaultValue: number) => FieldBag<string, number>;
}) {
  const context = { ...i18nContext, ...i18nContextExtra };

  function WeightInputField({ defaultValue, ...rest }: WeightInputFieldProps) {
    const { error, ...field } = useField(defaultValue);
    const { t } = useI18nLangContext(context);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <WeightInput
          bgColor={translatable ? "bg.info" : undefined}
          {...inputProps}
          {...field}
        />
      </Field>
    );
  }

  return WeightInputField;
}
