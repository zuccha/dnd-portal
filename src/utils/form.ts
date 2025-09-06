import { useCallback, useLayoutEffect, useState } from "react";
import { createMemorySetStore } from "../store/memory-set-store";
import { createMemoryStore } from "../store/memory-store";

//------------------------------------------------------------------------------
// Form
//------------------------------------------------------------------------------

export type Form<Fields extends Record<string, unknown>, SubmitContext> = {
  useField: <Name extends keyof Fields>(
    name: Name,
    defaultValue: Fields[Name],
    validate?: (value: Fields[Name]) => string | undefined
  ) => {
    disabled: boolean;
    error: string | undefined;
    name: Name;
    onBlur: () => void;
    onValueChange: (value: Fields[Name]) => void;
    value: Fields[Name];
  };
  useFieldError: (name: keyof Fields) => string | undefined;
  useSubmit: (context: SubmitContext) => [() => Promise<void>, boolean];
  useSubmitError: () => string | undefined;
  useValid: () => boolean;
};

//------------------------------------------------------------------------------
// Create Form
//------------------------------------------------------------------------------

export function createForm<
  Fields extends Record<string, unknown>,
  SubmitContext
>(
  onSubmit: (
    data: Partial<Fields>,
    context: SubmitContext
  ) => Promise<string | undefined>
): Form<Fields, SubmitContext> {
  //----------------------------------------------------------------------------
  // Values Store
  //----------------------------------------------------------------------------

  const {
    keys: valueFields,
    get: getValue,
    use: useValue,
  } = createMemorySetStore<Fields[keyof Fields], keyof Fields>();

  //----------------------------------------------------------------------------
  // Errors Store
  //----------------------------------------------------------------------------

  const {
    keys: errorFields,
    get: getError,
    use: useError,
    subscribeAll: subscribeAllErrors,
  } = createMemorySetStore<string | undefined, keyof Fields>();

  //----------------------------------------------------------------------------
  // Submit Error Store
  //----------------------------------------------------------------------------

  const submitErrorStore = createMemoryStore<string | undefined>(undefined);

  const useSubmitError = submitErrorStore.useValue;

  //----------------------------------------------------------------------------
  // Submitting Store
  //----------------------------------------------------------------------------

  const { use: useSubmitting } = createMemoryStore(false);

  //----------------------------------------------------------------------------
  // Use Form Field
  //----------------------------------------------------------------------------

  function useField<Name extends keyof Fields>(
    name: Name,
    defaultValue: Fields[Name],
    validate: (value: Fields[Name]) => string | undefined = () => undefined
  ): {
    disabled: boolean;
    error: string | undefined;
    name: Name;
    onBlur: () => void;
    onValueChange: (value: Fields[Name]) => void;
    value: Fields[Name];
  } {
    const [value, setValue] = useValue(name, defaultValue);
    const [error, setError] = useError(name, undefined);
    const [pristine, setPristine] = useState(true);
    const [disabled] = useSubmitting();

    const onBlur = useCallback(() => {
      setPristine(false);
      setError(validate(value as Fields[Name]));
    }, [setError, validate, value]);

    const onValueChange = useCallback(
      (value: Fields[Name]) => {
        if (!pristine) setError(validate(value));
        setValue(value);
      },
      [pristine, setError, setValue, validate]
    );

    return {
      disabled,
      error,
      name,
      onBlur,
      onValueChange,
      value: value as Fields[Name],
    };
  }

  //----------------------------------------------------------------------------
  // Use Error
  //----------------------------------------------------------------------------

  function useFieldError(name: keyof Fields): string | undefined {
    const [error] = useError(name, undefined);
    return error;
  }

  //----------------------------------------------------------------------------
  // Use Valid
  //----------------------------------------------------------------------------

  function isValid(): boolean {
    return errorFields().every((field) => !getError(field, undefined));
  }

  function useValid(): boolean {
    const [valid, setValid] = useState(isValid);
    useLayoutEffect(() => subscribeAllErrors(() => setValid(isValid())), []);
    return valid;
  }

  //----------------------------------------------------------------------------
  // Submit
  //----------------------------------------------------------------------------

  function useSubmit(context: SubmitContext): [() => Promise<void>, boolean] {
    const [submitting, setSubmitting] = useSubmitting();
    const setSubmitError = submitErrorStore.useSetValue();

    const submit = useCallback(async () => {
      if (!isValid()) return;

      setSubmitError(undefined);
      setSubmitting(true);

      const data: Partial<Fields> = {};
      valueFields().forEach((field) => {
        data[field] = getValue(field, undefined as Fields[keyof Fields]);
      });

      const error = await onSubmit(data, context);
      setSubmitError(error);
      setSubmitting(false);
    }, [context, setSubmitError, setSubmitting]);

    return [submit, submitting];
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return { useField, useFieldError, useSubmit, useSubmitError, useValid };
}
