import {
  Field as ChakraField,
  type FieldRootProps as ChakraFieldRootProps,
} from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Field
//------------------------------------------------------------------------------

export type FieldProps = ChakraFieldRootProps & {
  label?: string;
  error?: string;
  help?: string;
  optional?: string;
};

export default function Field({
  children,
  error,
  help,
  invalid,
  optional,
  label,
  ...rest
}: FieldProps) {
  return (
    <ChakraField.Root {...rest} invalid={invalid || !!error}>
      {label && (
        <ChakraField.Label>
          {label}
          <ChakraField.RequiredIndicator fallback={optional} />
        </ChakraField.Label>
      )}
      {children}
      {help && <ChakraField.HelperText>{help}</ChakraField.HelperText>}
      {error && <ChakraField.ErrorText>{error}</ChakraField.ErrorText>}
    </ChakraField.Root>
  );
}
