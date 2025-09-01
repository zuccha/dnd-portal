import {
  Field as ChakraField,
  type FieldRootProps as ChakraFieldRootProps,
} from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Field
//------------------------------------------------------------------------------

export type FieldProps = ChakraFieldRootProps & {
  label?: string;
  errorText?: string;
  helperText?: string;
  optionalText?: string;
};

export default function Field({
  children,
  errorText,
  helperText,
  optionalText,
  label,
  ...rest
}: FieldProps) {
  return (
    <ChakraField.Root {...rest}>
      {label && (
        <ChakraField.Label>
          {label}
          <ChakraField.RequiredIndicator fallback={optionalText} />
        </ChakraField.Label>
      )}
      {children}
      {helperText && (
        <ChakraField.HelperText>{helperText}</ChakraField.HelperText>
      )}
      {errorText && <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>}
    </ChakraField.Root>
  );
}
