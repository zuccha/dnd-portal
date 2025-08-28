import { Box, HStack, Popover, Portal, Span, VStack } from "@chakra-ui/react";
import { ChevronDownIcon, XIcon } from "lucide-react";
import Button, { type ButtonProps } from "./button";
import Icon from "./icon";
import IconButton from "./icon-button";
import InclusionButton from "./inclusion-button";

//------------------------------------------------------------------------------
// Inclusion Select
//------------------------------------------------------------------------------

export type InclusionSelectProps = Omit<ButtonProps, "onClick"> & {
  onValueChange: (partial: Record<string, boolean | undefined>) => void;
  options: { label: string; value: string }[];
  includes: Record<string, boolean | undefined>;
};

export default function InclusionSelect({
  children,
  onValueChange,
  options,
  includes,
  ...rest
}: InclusionSelectProps) {
  const count = Object.values(includes).filter(
    (include) => include !== undefined
  ).length;

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    const entries = options.map(({ value }) => [value, undefined]);
    onValueChange(Object.fromEntries(entries));
  };

  return (
    <Popover.Root positioning={{ sameWidth: true }}>
      <Popover.Trigger asChild>
        <Box position="relative">
          <Button {...rest} variant="outline">
            <HStack justify="space-between" w="full">
              {count ? (
                <HStack gap={1}>
                  {children}
                  <Span>{` (${count})`}</Span>
                </HStack>
              ) : (
                children
              )}
              <Icon Icon={ChevronDownIcon} color="fg.muted" />
            </HStack>
          </Button>

          {count > 0 && (
            <IconButton
              Icon={XIcon}
              disabled={count === 0}
              onClick={reset}
              position="absolute"
              right={0}
              rounded="full"
              top={0}
              transform={"translate(40%, -40%) scale(0.45)"}
              zIndex={1}
            />
          )}
        </Box>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content p={2} width="auto">
            <VStack align="flex-start" overflow="auto">
              {options.map(({ label, value }) => (
                <InclusionButton
                  include={includes[value]}
                  justifyContent={"flex-start"}
                  key={value}
                  onValueChange={(inc) => onValueChange({ [value]: inc })}
                  size="xs"
                  w="full"
                >
                  {label}
                </InclusionButton>
              ))}
            </VStack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
