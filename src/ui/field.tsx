import { type StackProps, Text, VStack } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Field
//------------------------------------------------------------------------------

export type FieldProps = StackProps & {
  label?: string;
  error?: string;
  help?: string;
};

export default function Field({
  children,
  error,
  help,
  label,
  ...rest
}: FieldProps) {
  return (
    <VStack align="flex-start" gap={1.5} w="full" {...rest}>
      {label && (
        <Text fontSize="sm" fontWeight="medium" lineHeight={1.25}>
          {label}
        </Text>
      )}
      {children}
      {help && (
        <Text color="fg.muted" fontSize="xs" lineHeight={1}>
          {help}
        </Text>
      )}
      {error && (
        <Text color="fg.error" fontSize="xs" lineHeight={1}>
          {error}
        </Text>
      )}
    </VStack>
  );
}
