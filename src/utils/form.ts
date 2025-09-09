import { useCallback, useLayoutEffect, useState } from "react";
import { createMemorySetStore } from "../store/memory-set-store";
import { createMemoryStore } from "../store/memory-store";
import { createObservable } from "./observable";

//------------------------------------------------------------------------------
// Form
//------------------------------------------------------------------------------

export type Form<Fields extends Record<string, unknown>> = {
  reset: () => void;
  useField: <Name extends keyof Fields>(
    name: Name,
    defaultValue: Fields[Name],
    validate?: (value: Fields[Name]) => string | undefined
  ) => {
    "data-invalid": "" | undefined;
    "disabled": boolean;
    "error": string | undefined;
    "name": Name;
    "onBlur": () => void;
    "onValueChange": (value: Fields[Name]) => void;
    "value": Fields[Name];
  };
  useFieldError: (name: keyof Fields) => string | undefined;
  useSubmit: (
    onSubmit: (data: Partial<Fields>) => Promise<string | undefined>
  ) => [() => Promise<string | undefined>, boolean];
  useSubmitError: () => string | undefined;
  useValid: () => boolean;
};

//------------------------------------------------------------------------------
// Create Form
//------------------------------------------------------------------------------

export function createForm<
  Fields extends Record<string, unknown>
>(): Form<Fields> {
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
    "data-invalid": "" | undefined;
    "disabled": boolean;
    "error": string | undefined;
    "name": Name;
    "onBlur": () => void;
    "onValueChange": (value: Fields[Name]) => void;
    "value": Fields[Name];
  } {
    const [value, setValue] = useValue(name, defaultValue);
    const [error, setError] = useError(name, undefined);
    const [pristine, setPristine] = useState(true);
    const [disabled] = useSubmitting();

    useLayoutEffect(() => {
      setError(validate(defaultValue));
    }, [defaultValue, setError, validate]);

    useLayoutEffect(() => {
      subscribeReset(() => {
        setValue(defaultValue);
        setError(validate(defaultValue));
        setPristine(true);
      });
    }, [defaultValue, setError, setValue, validate]);

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
      "data-invalid": !pristine && error ? "" : undefined,
      disabled,
      "error": pristine ? undefined : error,
      name,
      onBlur,
      onValueChange,
      "value": value as Fields[Name],
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

  function useSubmit(
    onSubmit: (data: Partial<Fields>) => Promise<string | undefined>
  ): [() => Promise<string | undefined>, boolean] {
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

      const error = await onSubmit(data);
      setSubmitError(error);
      setSubmitting(false);

      return error;
    }, [onSubmit, setSubmitError, setSubmitting]);

    return [submit, submitting];
  }

  //----------------------------------------------------------------------------
  // Reset
  //----------------------------------------------------------------------------

  const { notify: notifyReset, subscribe: subscribeReset } = createObservable();

  function reset() {
    notifyReset(undefined);
  }

  //----------------------------------------------------------------------------
  // Return
  //----------------------------------------------------------------------------

  return {
    reset,
    useField,
    useFieldError,
    useSubmit,
    useSubmitError,
    useValid,
  };
}
