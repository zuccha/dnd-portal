import { useCallback, useLayoutEffect, useState } from "react";
import { createMemorySetStore } from "~/store/memory-set-store";
import { createMemoryStore } from "~/store/memory-store";
import { createObservable } from "./observable";

//------------------------------------------------------------------------------
// Form
//------------------------------------------------------------------------------

export type Form<Fields extends Record<string, unknown>> = {
  copyDataToClipboard: () => Promise<void>;
  pasteDataFromClipboard: () => Promise<void>;
  reset: () => void;
  useField: <Name extends keyof Fields>(
    name: Name,
    defaultValue: Fields[Name],
    validate?: (value: Fields[Name]) => string | undefined,
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
    onSubmit: (data: Partial<Fields>) => Promise<string | undefined>,
  ) => [() => Promise<string | undefined>, boolean];
  useSubmitError: () => string | undefined;
  useValid: () => boolean;
};

//------------------------------------------------------------------------------
// Create Form
//------------------------------------------------------------------------------

export function createForm<Fields extends Record<string, unknown>>(
  parseData: (maybeData: unknown) => Fields,
): Form<Fields> {
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
  // Value Changers Store
  //----------------------------------------------------------------------------

  type Changer<Field extends keyof Fields> = (value: Fields[Field]) => void;
  const valueChangers: { [K in keyof Fields]?: Changer<K> } = {};

  //----------------------------------------------------------------------------
  // Build Data
  //----------------------------------------------------------------------------

  function buildData(): Partial<Fields> {
    const data: Partial<Fields> = {};
    const empty = undefined as Fields[keyof Fields];
    valueFields().forEach((field) => (data[field] = getValue(field, empty)));
    return data;
  }

  //----------------------------------------------------------------------------
  // Copy Data to Clipboard
  //----------------------------------------------------------------------------

  async function copyDataToClipboard(): Promise<void> {
    await navigator.clipboard.writeText(JSON.stringify(buildData(), null, 2));
  }

  //----------------------------------------------------------------------------
  // Paste Data from Clipboard
  //----------------------------------------------------------------------------

  async function pasteDataFromClipboard(): Promise<void> {
    const text = await navigator.clipboard.readText();
    const data = parseData(JSON.parse(text));
    const fields = valueFields();

    for (const field of fields) {
      const onValueChange = valueChangers[field];
      const value = data[field];
      onValueChange?.(value);
    }
  }

  //----------------------------------------------------------------------------
  // Use Form Field
  //----------------------------------------------------------------------------

  function useField<Name extends keyof Fields>(
    name: Name,
    defaultValue: Fields[Name],
    validate: (value: Fields[Name]) => string | undefined = () => undefined,
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
    const [disabled] = useSubmitting();

    const onBlur = useCallback(() => {
      // Nothing.
    }, []);

    const onValueChange = useCallback(
      (value: Fields[Name]) => {
        setError(validate(value));
        setValue(value);
      },
      [setError, setValue, validate],
    );

    useLayoutEffect(() => {
      valueChangers[name] = onValueChange;
      return () => (valueChangers[name] = undefined);
    }, [defaultValue, name, onValueChange]);

    useLayoutEffect(() => {
      setError(validate(defaultValue));
    }, [defaultValue, setError, validate]);

    useLayoutEffect(() => {
      subscribeReset(() => {
        setValue(defaultValue);
        setError(validate(defaultValue));
      });
    }, [defaultValue, setError, setValue, validate]);

    return {
      "data-invalid": error ? "" : undefined,
      disabled,
      error,
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
    onSubmit: (data: Partial<Fields>) => Promise<string | undefined>,
  ): [() => Promise<string | undefined>, boolean] {
    const [submitting, setSubmitting] = useSubmitting();
    const setSubmitError = submitErrorStore.useSetValue();

    const submit = useCallback(async () => {
      if (!isValid()) return;

      setSubmitError(undefined);
      setSubmitting(true);

      const error = await onSubmit(buildData());
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
    copyDataToClipboard,
    pasteDataFromClipboard,
    reset,
    useField,
    useFieldError,
    useSubmit,
    useSubmitError,
    useValid,
  };
}
